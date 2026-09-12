export class OpenDataLocalProvider {
  constructor({ db = null } = {}) {
    this.id = "open_data_local_mirror";
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
        status: "not_ready",
        provider: this.id,
        reason: "dataset_not_configured",
        detail: "D1 dataset mirror is not configured.",
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
      String(source ?? "").trim();

    if (!normalizedSource) {
      return {
        ok: false,
        status: "failed",
        provider: this.id,
        reason: "source_required",
        records: [],
      };
    }

    try {
      /*
       * First determine whether this source actually
       * exists in the local mirror.
       *
       * An empty dataset must never be interpreted
       * as "no matching regulatory/open-data records".
       */
      const sourceStats = await this.db
        .prepare(
          `SELECT
             COUNT(*) AS total_records,
             MAX(source_updated_at) AS latest_source_update
           FROM public_dataset_records
           WHERE source = ?`,
        )
        .bind(normalizedSource)
        .first();

      const totalRecords =
        Number(sourceStats?.total_records ?? 0);

      const latestSourceUpdate =
        sourceStats?.latest_source_update ?? null;

      if (totalRecords === 0) {
        return {
          ok: false,
          status: "not_ready",
          provider: this.id,
          reason: "dataset_empty",
          detail:
            `The local mirror contains no records for source "${normalizedSource}". ` +
            "An empty result cannot be interpreted as evidence that no matching records exist.",
          records: [],
          coverage: {
            source: normalizedSource,
            available: false,
            totalRecords: 0,
            latestSourceUpdate: null,
            conclusive: false,
          },
        };
      }

      const clauses = ["source = ?"];
      const params = [normalizedSource];

      if (cnpj) {
        clauses.push("cnpj = ?");
        params.push(
          String(cnpj)
            .replace(/[^A-Z0-9]/gi, "")
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

      const result = await this.db
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
           WHERE ${clauses.join(" AND ")}
           ORDER BY source_updated_at DESC
           LIMIT ?`,
        )
        .bind(
          ...params,
          effectiveLimit,
        )
        .all();

      const records =
        (result?.results ?? []).map(
          (row) => ({
            ...row,
            payload:
              parse(row.payload_json),
          }),
        );

      return {
        ok: true,
        status: "success",
        provider: this.id,
        records,

        result: {
          matches: records.length,
          noMatches:
            records.length === 0,
          conclusive: true,
          interpretation:
            records.length === 0
              ? "The source is populated in the local mirror, but no records matched this query."
              : "Matching records were found in the populated local mirror.",
        },

        coverage: {
          source: normalizedSource,
          available: true,
          totalRecords,
          latestSourceUpdate,
          conclusive: true,
          queryLimit:
            effectiveLimit,
        },
      };
    } catch (error) {
      return {
        ok: false,
        status: "failed",
        provider: this.id,
        reason: "dataset_query_error",
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

function parse(value) {
  try {
    return typeof value === "string"
      ? JSON.parse(value)
      : value;
  } catch {
    return value;
  }
}
