export class OpenDataLocalProvider {
  constructor({ db = null } = {}) {
    this.id = 'open_data_local_mirror';
    this.db = db;
  }

  async search({
    source,
    query = null,
    cnpj = null,
    limit = 50,
  }) {
    if (!this.db?.prepare) {
      return {
        ok: false,
        status: 'not_ready',
        provider: this.id,
        reason: 'dataset_not_configured',
        detail:
          'D1 dataset mirror is not configured.',
        records: [],
        coverage: {
          source,
          available: false,
          totalRecords: 0,
          conclusive: false,
        },
      };
    }

    const normalizedSource =
      String(source ?? '').trim();

    if (!normalizedSource) {
      return {
        ok: false,
        status: 'failed',
        provider: this.id,
        reason: 'source_required',
        records: [],
      };
    }

    try {
      const syncState =
        await readSyncState(
          this.db,
          normalizedSource,
        );

      const sourceStats =
        await this.db
          .prepare(
            `SELECT
               COUNT(*) AS total_records,
               MAX(source_updated_at)
                 AS latest_source_update
             FROM public_dataset_records
             WHERE source = ?`,
          )
          .bind(normalizedSource)
          .first();

      const totalRecords =
        Number(
          sourceStats?.total_records ?? 0,
        );

      const latestSourceUpdate =
        sourceStats
          ?.latest_source_update ??
        null;

      /*
       * If this source has a managed
       * synchronization lifecycle,
       * partial data must never be
       * interpreted as complete data.
       */
      if (
        syncState &&
        syncState.status !== 'ready'
      ) {
        return {
          ok: false,
          status: 'not_ready',
          provider: this.id,
          reason:
            'dataset_sync_incomplete',
          detail:
            `The local mirror for source "${normalizedSource}" is currently ` +
            `in synchronization state "${syncState.status}". ` +
            'Partial records cannot be interpreted as complete source coverage.',
          records: [],
          coverage: {
            source:
              normalizedSource,
            available: false,
            totalRecords,
            latestSourceUpdate,
            expectedRecords:
              numberOrNull(
                syncState
                  .expected_records,
              ),
            loadedRecords:
              numberOrNull(
                syncState
                  .staged_records,
              ),
            nextPage:
              numberOrNull(
                syncState.next_page,
              ),
            totalPages:
              numberOrNull(
                syncState.total_pages,
              ),
            syncStatus:
              syncState.status,
            conclusive: false,
          },
        };
      }

      /*
       * Even a state marked ready is
       * not trusted if its expected
       * record count and actual mirror
       * count disagree.
       */
      if (
        syncState?.status ===
          'ready' &&
        syncState
          .expected_records !=
          null &&
        Number(
          syncState
            .expected_records,
        ) !== totalRecords
      ) {
        return {
          ok: false,
          status: 'not_ready',
          provider: this.id,
          reason:
            'dataset_count_mismatch',
          detail:
            `The local mirror for source "${normalizedSource}" is marked ready, ` +
            'but its actual record count does not match the completed synchronization.',
          records: [],
          coverage: {
            source:
              normalizedSource,
            available: false,
            totalRecords,
            expectedRecords:
              Number(
                syncState
                  .expected_records,
              ),
            latestSourceUpdate,
            syncStatus:
              syncState.status,
            conclusive: false,
          },
        };
      }

      if (totalRecords === 0) {
        return {
          ok: false,
          status: 'not_ready',
          provider: this.id,
          reason: 'dataset_empty',
          detail:
            `The local mirror contains no records for source "${normalizedSource}". ` +
            'An empty result cannot be interpreted as evidence that no matching records exist.',
          records: [],
          coverage: {
            source:
              normalizedSource,
            available: false,
            totalRecords: 0,
            latestSourceUpdate:
              null,
            conclusive: false,
          },
        };
      }

      const clauses = [
        'source = ?',
      ];

      const params = [
        normalizedSource,
      ];

      if (cnpj) {
        clauses.push(
          'cnpj = ?',
        );

        params.push(
          String(cnpj)
            .replace(
              /[^A-Z0-9]/gi,
              '',
            )
            .toUpperCase(),
        );
      }

      if (query) {
        clauses.push(
          `(UPPER(name) LIKE UPPER(?)
            OR UPPER(category) LIKE UPPER(?)
            OR UPPER(payload_json) LIKE UPPER(?))`,
        );

        const q =
          `%${String(query).trim()}%`;

        params.push(q, q, q);
      }

      const effectiveLimit =
        Math.min(
          500,
          Math.max(
            1,
            Number(limit) || 50,
          ),
        );

      const result =
        await this.db
          .prepare(
            `SELECT
               source,
               entity_id,
               name,
               cnpj,
               category,
               payload_json,
               source_updated_at,
               source_url
             FROM public_dataset_records
             WHERE ${clauses.join(
               ' AND ',
             )}
             ORDER BY
               source_updated_at DESC
             LIMIT ?`,
          )
          .bind(
            ...params,
            effectiveLimit,
          )
          .all();

      const records =
        (
          result?.results ?? []
        ).map((row) => ({
          ...row,
          payload:
            parse(
              row.payload_json,
            ),
        }));

      return {
        ok: true,
        status: 'success',
        provider: this.id,
        records,

        result: {
          matches:
            records.length,

          noMatches:
            records.length === 0,

          conclusive: true,

          interpretation:
            records.length === 0
              ? 'The source is fully synchronized in the local mirror, but no records matched this query.'
              : 'Matching records were found in the synchronized local mirror.',
        },

        coverage: {
          source:
            normalizedSource,

          available: true,

          totalRecords,

          latestSourceUpdate,

          conclusive: true,

          queryLimit:
            effectiveLimit,

          syncStatus:
            syncState?.status ??
            null,

          completedAt:
            syncState
              ?.completed_at ??
            null,
        },
      };
    } catch (error) {
      return {
        ok: false,
        status: 'failed',
        provider: this.id,
        reason:
          'dataset_query_error',
        detail:
          String(
            error?.message ??
              error,
          ),
        records: [],
      };
    }
  }
}

async function readSyncState(
  db,
  source,
) {
  try {
    return await db
      .prepare(
        `SELECT
           source,
           staging_source,
           status,
           next_page,
           total_pages,
           expected_records,
           staged_records,
           started_at,
           last_run_at,
           completed_at,
           next_refresh_at,
           last_error,
           source_url,
           updated_at
         FROM dataset_sync_state
         WHERE source = ?`,
      )
      .bind(source)
      .first();
  } catch (error) {
    /*
     * Preserve compatibility with
     * databases/tests that have not
     * applied migration 0003 yet.
     */
    const message =
      String(
        error?.message ?? error,
      );

    if (
      /no such table.*dataset_sync_state/i.test(
        message,
      )
    ) {
      return null;
    }

    throw error;
  }
}

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function parse(value) {
  try {
    return typeof value ===
      'string'
      ? JSON.parse(value)
      : value;
  } catch {
    return value;
  }
}
