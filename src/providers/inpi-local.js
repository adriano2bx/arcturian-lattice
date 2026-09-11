import { normalizeCnpj } from "../core/cnpj.js";

export class InpiLocalProvider {
  constructor({ db = null, now = () => new Date() } = {}) {
    this.id = "inpi_local_mirror";
    this.db = db;
    this.now = now;
  }

  configured() {
    return Boolean(this.db?.prepare);
  }

  async searchByCompany({ cnpj, legalName = null, limit = 100 }) {
    const normalizedCnpj = cnpj ? normalizeCnpj(cnpj) : null;
    const capped = Math.max(1, Math.min(Number(limit) || 100, 500));

    if (!this.configured()) {
      return {
        ok: false,
        provider: this.id,
        reason: "dataset_not_configured",
        detail:
          "Bind a D1 database as DB and import the official INPI dataset/API export into ip_assets.",
      };
    }

    const clauses = [];
    const params = [];
    if (normalizedCnpj) {
      clauses.push("holder_cnpj = ?");
      params.push(normalizedCnpj);
    }
    if (legalName) {
      clauses.push("UPPER(holder_name) LIKE UPPER(?)");
      params.push(`%${String(legalName).trim()}%`);
    }
    if (!clauses.length) throw new Error("cnpj or legalName is required.");

    const sql = `
      SELECT
        asset_type, process_number, title, status, holder_name, holder_cnpj,
        filing_date, grant_date, expiry_date, nice_classes_json, source_updated_at,
        source_url
      FROM ip_assets
      WHERE ${clauses.join(" OR ")}
      ORDER BY COALESCE(filing_date, grant_date, source_updated_at) DESC
      LIMIT ?
    `;

    let result;
    try {
      result = await this.db.prepare(sql).bind(...params, capped).all();
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: "dataset_query_error",
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const rows = Array.isArray(result?.results) ? result.results : [];
    return {
      ok: true,
      provider: this.id,
      assets: rows.map(normalizeIpAsset),
      dataset: {
        source: "INPI",
        mode: "local_mirror",
        observedAt: this.now().toISOString(),
        records: rows.length,
      },
    };
  }
}

export function normalizeIpAsset(row) {
  return {
    type: row.asset_type ?? null,
    processNumber: row.process_number ?? null,
    title: row.title ?? null,
    status: row.status ?? null,
    holder: {
      name: row.holder_name ?? null,
      cnpj: row.holder_cnpj ? normalizeCnpj(row.holder_cnpj) : null,
    },
    dates: {
      filing: row.filing_date ?? null,
      grant: row.grant_date ?? null,
      expiry: row.expiry_date ?? null,
      sourceUpdatedAt: row.source_updated_at ?? null,
    },
    niceClasses: parseJsonArray(row.nice_classes_json),
    sourceUrl: row.source_url ?? null,
  };
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
