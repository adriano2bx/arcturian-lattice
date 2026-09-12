import { normalizeCnpj } from "../core/cnpj.js";

export class InpiLocalProvider {
  constructor({
    db = null,
    now = () => new Date(),
  } = {}) {
    this.id = "inpi_local_mirror";
    this.db = db;
    this.now = now;
  }

  configured() {
    return Boolean(this.db?.prepare);
  }

  async searchByCompany({
    cnpj,
    legalName = null,
    limit = 100,
  }) {
    const normalizedCnpj =
      cnpj ? normalizeCnpj(cnpj) : null;

    const capped =
      Math.max(
        1,
        Math.min(
          Number(limit) || 100,
          500,
        ),
      );

    if (!this.configured()) {
      return {
        ok: false,
        status: "not_ready",
        provider: this.id,
        reason: "dataset_not_configured",
        detail:
          "Bind a D1 database as DB and import the official INPI dataset/API export into ip_assets.",
        assets: [],
        coverage: {
          available: false,
          totalRecords: 0,
          conclusive: false,
        },
      };
    }

    if (
      !normalizedCnpj &&
      !legalName
    ) {
      throw new Error(
        "cnpj or legalName is required.",
      );
    }

    try {
      /*
       * First verify whether the INPI mirror
       * actually contains any data.
       *
       * Empty mirror != company has no IP assets.
       */
      const stats =
        await this.db
          .prepare(
            `SELECT
               COUNT(*) AS total_records,
               MAX(source_updated_at) AS latest_source_update
             FROM ip_assets`,
          )
          .first();

      const totalRecords =
        Number(
          stats?.total_records ?? 0,
        );

      const latestSourceUpdate =
        stats?.latest_source_update ??
        null;

      if (totalRecords === 0) {
        return {
          ok: false,
          status: "not_ready",
          provider: this.id,
          reason: "dataset_empty",
          detail:
            "The local INPI mirror contains no records. " +
            "An empty result cannot be interpreted as evidence that the company has no intellectual-property assets.",
          assets: [],

          coverage: {
            source: "INPI",
            mode: "local_mirror",
            available: false,
            totalRecords: 0,
            latestSourceUpdate: null,
            conclusive: false,
          },

          dataset: {
            source: "INPI",
            mode: "local_mirror",
            observedAt:
              this.now().toISOString(),
            records: 0,
          },
        };
      }

      const clauses = [];
      const params = [];

      if (normalizedCnpj) {
        clauses.push(
          "holder_cnpj = ?",
        );
        params.push(
          normalizedCnpj,
        );
      }

      if (legalName) {
        clauses.push(
          "UPPER(holder_name) LIKE UPPER(?)",
        );

        params.push(
          `%${String(
            legalName,
          ).trim()}%`,
        );
      }

      const sql = `
        SELECT
          asset_type,
          process_number,
          title,
          status,
          holder_name,
          holder_cnpj,
          filing_date,
          grant_date,
          expiry_date,
          nice_classes_json,
          source_updated_at,
          source_url
        FROM ip_assets
        WHERE ${clauses.join(" OR ")}
        ORDER BY
          COALESCE(
            filing_date,
            grant_date,
            source_updated_at
          ) DESC
        LIMIT ?
      `;

      const result =
        await this.db
          .prepare(sql)
          .bind(
            ...params,
            capped,
          )
          .all();

      const rows =
        Array.isArray(
          result?.results,
        )
          ? result.results
          : [];

      const assets =
        rows.map(
          normalizeIpAsset,
        );

      return {
        ok: true,
        status: "success",
        provider: this.id,
        assets,

        result: {
          matches:
            assets.length,

          noMatches:
            assets.length === 0,

          conclusiveWithinMirror:
            true,

          interpretation:
            assets.length === 0
              ? "No matching IP assets were found in the populated local INPI mirror. This does not prove that no INPI records exist unless mirror completeness and freshness are independently assured."
              : "Matching IP assets were found in the local INPI mirror.",
        },

        coverage: {
          source: "INPI",
          mode: "local_mirror",
          available: true,
          totalRecords,
          latestSourceUpdate,
          queryConclusiveWithinMirror:
            true,
          officialCoverageKnown:
            false,
        },

        dataset: {
          source: "INPI",
          mode: "local_mirror",
          observedAt:
            this.now().toISOString(),
          totalRecords,
          matchedRecords:
            assets.length,
        },
      };
    } catch (error) {
      return {
        ok: false,
        status: "failed",
        provider: this.id,
        reason: "dataset_query_error",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
        assets: [],
      };
    }
  }
}

export function normalizeIpAsset(
  row,
) {
  return {
    type:
      row.asset_type ?? null,

    processNumber:
      row.process_number ?? null,

    title:
      row.title ?? null,

    status:
      row.status ?? null,

    holder: {
      name:
        row.holder_name ?? null,

      cnpj:
        row.holder_cnpj
          ? normalizeCnpj(
              row.holder_cnpj,
            )
          : null,
    },

    dates: {
      filing:
        row.filing_date ?? null,

      grant:
        row.grant_date ?? null,

      expiry:
        row.expiry_date ?? null,

      sourceUpdatedAt:
        row.source_updated_at ??
        null,
    },

    niceClasses:
      parseJsonArray(
        row.nice_classes_json,
      ),

    sourceUrl:
      row.source_url ?? null,
  };
}

function parseJsonArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}
