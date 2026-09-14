import { AnatelStelProvider } from "../providers/anatel-stel.js";

const SOURCE = "anatel";
const CATEGORY = "SCM";

/*
 * 8 parâmetros por registro.
 * 12 registros = 96 parâmetros,
 * mantendo cada INSERT abaixo de 100.
 */
const ROWS_PER_INSERT = 12;

export class AnatelSyncService {
  constructor({
    db = null,
    fetchFn = globalThis.fetch,
    now = () => new Date(),
  } = {}) {
    this.db = db;
    this.fetchFn = fetchFn;
    this.now = now;
  }

  configured() {
    return Boolean(this.db?.prepare);
  }

  async syncNextPage() {
    if (!this.configured()) {
      return {
        ok: false,
        status: "not_ready",
        reason: "dataset_not_configured",
        detail: "D1 binding DB is required.",
      };
    }

    const state = await this.#readState();

    if (!state) {
      return {
        ok: false,
        status: "not_ready",
        reason: "sync_state_missing",
        detail: "dataset_sync_state has no ANATEL configuration.",
      };
    }

    const totalPages = Number(state.total_pages ?? 0);

    const expectedRecords = Number(state.expected_records ?? 0);

    let page = Number(state.next_page ?? 1);

    if (state.status === "ready" && page > totalPages) {
      return {
        ok: true,
        status: "ready",
        source: SOURCE,
        message: "ANATEL mirror is already fully synchronized.",
        progress: {
          page: totalPages,
          totalPages,
          records: Number(state.staged_records ?? expectedRecords),
          expectedRecords,
          complete: true,
        },
      };
    }

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(totalPages) ||
      totalPages < 1
    ) {
      return {
        ok: false,
        status: "failed",
        reason: "invalid_sync_state",
        state,
      };
    }

    /*
     * Fresh initial synchronization.
     * Existing ANATEL rows are removed
     * only when starting from page 1.
     */
    if (page === 1 && state.status === "idle") {
      const now = this.now().toISOString();

      await this.db.batch([
        this.db
          .prepare(
            `DELETE FROM
               public_dataset_records
             WHERE source = ?`,
          )
          .bind(SOURCE),

        this.db
          .prepare(
            `UPDATE
               dataset_sync_state
             SET
               status = 'syncing',
               staged_records = 0,
               started_at = ?,
               last_run_at = NULL,
               completed_at = NULL,
               next_refresh_at = NULL,
               last_error = NULL,
               updated_at = ?
             WHERE source = ?`,
          )
          .bind(now, now, SOURCE),
      ]);
    }

    /*
     * A failed page can be retried from
     * next_page because page writes are
     * idempotent through the unique key
     * (source, entity_id).
     */
    if (state.status === "failed") {
      const now = this.now().toISOString();

      await this.db
        .prepare(
          `UPDATE
             dataset_sync_state
           SET
             status = 'syncing',
             last_error = NULL,
             updated_at = ?
           WHERE source = ?`,
        )
        .bind(now, SOURCE)
        .run();
    }

    const provider = new AnatelStelProvider({
      fetchFn: this.fetchFn,
    });

    const upstream = await provider.fetchPage({
      service: "045",
      page,
    });

    if (!upstream.ok) {
      await this.#markFailed(
        `Page ${page}: ${upstream.reason ?? "upstream_error"}`,
      );

      return {
        ok: false,
        status: "failed",
        source: SOURCE,
        page,
        upstream,
      };
    }

    const records = upstream.records ?? [];

    const expectedForPage = expectedPageSize({
      page,
      totalPages,
      expectedRecords,
    });

    /*
     * Never persist a suspiciously
     * incomplete upstream page.
     */
    if (
      expectedForPage !== null &&
      page < totalPages &&
      records.length !== expectedForPage
    ) {
      const detail =
        `ANATEL STEL page ${page} returned ${records.length} records; ` +
        `${expectedForPage} were expected.`;

      await this.#markFailed(detail);

      return {
        ok: false,
        status: "failed",
        source: SOURCE,
        reason: "unexpected_page_size",
        detail,
        page,
        count: records.length,
        expected: expectedForPage,
      };
    }

    const observedAt = this.now().toISOString();

    const statements = [];

    for (let index = 0; index < records.length; index += ROWS_PER_INSERT) {
      const chunk = records.slice(index, index + ROWS_PER_INSERT);

      statements.push(
        buildUpsertStatement({
          db: this.db,
          records: chunk,
          observedAt,
          sourceUrl: upstream.sourceUrl,
        }),
      );
    }

    if (statements.length) {
      await this.db.batch(statements);
    }

    const countRow = await this.db
      .prepare(
        `SELECT
             COUNT(*) AS total
           FROM public_dataset_records
           WHERE source = ?`,
      )
      .bind(SOURCE)
      .first();

    const loadedRecords = Number(countRow?.total ?? 0);

    const isLastPage = page === totalPages;

    if (isLastPage) {
      if (loadedRecords < 1) {
        const detail =
          "ANATEL synchronization reached the final page without any records.";

        await this.#markFailed(detail, loadedRecords);

        return {
          ok: false,
          status: "failed",
          source: SOURCE,
          reason: "empty_dataset",
          detail,
          progress: {
            page,
            totalPages,
            loadedRecords,
            expectedRecords,
            complete: false,
          },
        };
      }

      const completedAt = this.now().toISOString();

      // The portal's total-count hint counts source rows, while this mirror
      // deduplicates by process identifier. Persist the observed deduplicated
      // count after every page has been consumed.
      await this.db
        .prepare(
          `UPDATE
             dataset_sync_state
           SET
             status = 'ready',
             next_page = ?,
             staged_records = ?,
             expected_records = ?,
             last_run_at = ?,
             completed_at = ?,
             last_error = NULL,
             updated_at = ?
           WHERE source = ?`,
        )
        .bind(
          totalPages + 1,
          loadedRecords,
          loadedRecords,
          completedAt,
          completedAt,
          completedAt,
          SOURCE,
        )
        .run();

      return {
        ok: true,
        status: "ready",
        source: SOURCE,
        provider: upstream.provider,
        page,
        insertedOrUpdated: records.length,
        progress: {
          page,
          totalPages,
          loadedRecords,
          expectedRecords,
          complete: true,
        },
      };
    }

    const nextPage = page + 1;

    await this.db
      .prepare(
        `UPDATE
           dataset_sync_state
         SET
           status = 'syncing',
           next_page = ?,
           staged_records = ?,
           last_run_at = ?,
           last_error = NULL,
           updated_at = ?
         WHERE source = ?`,
      )
      .bind(nextPage, loadedRecords, observedAt, observedAt, SOURCE)
      .run();

    return {
      ok: true,
      status: "syncing",
      source: SOURCE,
      provider: upstream.provider,

      page,

      insertedOrUpdated: records.length,

      progress: {
        page,
        nextPage,
        totalPages,
        loadedRecords,
        expectedRecords,
        percent: Number(((loadedRecords / expectedRecords) * 100).toFixed(2)),
        complete: false,
      },
    };
  }

  async #readState() {
    return this.db
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
      .bind(SOURCE)
      .first();
  }

  async #markFailed(error, loadedRecords = null) {
    const now = this.now().toISOString();

    if (loadedRecords === null) {
      await this.db
        .prepare(
          `UPDATE
             dataset_sync_state
           SET
             status = 'failed',
             last_run_at = ?,
             last_error = ?,
             updated_at = ?
           WHERE source = ?`,
        )
        .bind(now, error, now, SOURCE)
        .run();

      return;
    }

    await this.db
      .prepare(
        `UPDATE
           dataset_sync_state
         SET
           status = 'failed',
           staged_records = ?,
           last_run_at = ?,
           last_error = ?,
           updated_at = ?
         WHERE source = ?`,
      )
      .bind(loadedRecords, now, error, now, SOURCE)
      .run();
  }
}

function buildUpsertStatement({ db, records, observedAt, sourceUrl }) {
  const placeholders = records.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

  const params = [];

  for (const record of records) {
    params.push(
      SOURCE,
      record.entityId,
      record.name,
      null,
      CATEGORY,
      JSON.stringify(record),
      observedAt,
      sourceUrl,
    );
  }

  return db
    .prepare(
      `INSERT INTO public_dataset_records (
         source,
         entity_id,
         name,
         cnpj,
         category,
         payload_json,
         source_updated_at,
         source_url
       )
       VALUES
         ${placeholders}
       ON CONFLICT(
         source,
         entity_id
       )
       DO UPDATE SET
         name =
           excluded.name,
         cnpj =
           excluded.cnpj,
         category =
           excluded.category,
         payload_json =
           excluded.payload_json,
         source_updated_at =
           excluded.source_updated_at,
         source_url =
           excluded.source_url`,
    )
    .bind(...params);
}

function expectedPageSize({ page, totalPages, expectedRecords }) {
  if (
    !Number.isInteger(expectedRecords) ||
    expectedRecords < 1 ||
    !Number.isInteger(totalPages) ||
    totalPages < 1
  ) {
    return null;
  }

  const pageSize = 500;

  if (page < totalPages) {
    return pageSize;
  }

  if (page === totalPages) {
    return expectedRecords - pageSize * (totalPages - 1);
  }

  return null;
}
