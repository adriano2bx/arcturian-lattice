import { normalizeCnpj } from "../core/cnpj.js";

export class PncpContractsProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = "https://pncp.gov.br/api/consulta" } = {}) {
    this.id = "pncp";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async searchContracts({
    cnpj,
    role = "supplier",
    dateFrom,
    dateTo,
    pageSize = 500,
    maxPages = 5,
  }) {
    const normalizedCnpj = normalizeCnpj(cnpj);
    const from = normalizePncpDate(dateFrom);
    const to = normalizePncpDate(dateTo);

    if (!['supplier', 'organization'].includes(role)) {
      throw new Error("role must be 'supplier' or 'organization'.");
    }
    if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 20) {
      throw new Error("maxPages must be an integer between 1 and 20.");
    }
    if (!Number.isInteger(pageSize) || pageSize < 10 || pageSize > 500) {
      throw new Error("pageSize must be an integer between 10 and 500.");
    }

    const matches = [];
    const attempts = [];
    let totalPages = null;
    let exhausted = false;

    for (let page = 1; page <= maxPages; page += 1) {
      const url = new URL(`${this.baseUrl}/v1/contratos`);
      url.searchParams.set("dataInicial", from);
      url.searchParams.set("dataFinal", to);
      url.searchParams.set("pagina", String(page));
      url.searchParams.set("tamanhoPagina", String(pageSize));
      if (role === "organization") {
        url.searchParams.set("cnpjOrgao", normalizedCnpj);
      }

      let response;
      try {
        response = await this.fetchFn(url.toString(), {
          headers: { accept: "application/json" },
        });
      } catch (error) {
        attempts.push({ page, status: "network_error" });
        return {
          ok: false,
          provider: this.id,
          reason: "network_error",
          detail: error instanceof Error ? error.message : String(error),
          attempts,
        };
      }

      if (!response.ok) {
        attempts.push({ page, status: `http_${response.status}` });
        return {
          ok: false,
          provider: this.id,
          reason: response.status === 429 ? "rate_limited" : "upstream_error",
          status: response.status,
          attempts,
        };
      }

      const payload = await response.json();
      const items = extractItems(payload);
      totalPages = extractTotalPages(payload) ?? totalPages;
      attempts.push({ page, status: "success", records: items.length });

      const selected = role === "supplier"
        ? items.filter((item) => normalizeLooseIdentifier(item.niFornecedor) === normalizedCnpj)
        : items;

      for (const item of selected) {
        matches.push(normalizeContract(item));
      }

      const pageWasShort = items.length < pageSize;
      const reachedDeclaredEnd = totalPages !== null && page >= totalPages;
      if (pageWasShort || reachedDeclaredEnd || items.length === 0) {
        exhausted = true;
        break;
      }
    }

    return {
      ok: true,
      provider: this.id,
      contracts: matches,
      coverage: {
        complete: exhausted,
        role,
        publicationDateFrom: from,
        publicationDateTo: to,
        pagesScanned: attempts.length,
        pageSize,
        declaredTotalPages: totalPages,
        note:
          role === "supplier"
            ? "Supplier mode filters PNCP contract publication results client-side because the public query endpoint documents organization CNPJ, not supplier CNPJ, as a server-side filter."
            : null,
      },
      attempts,
    };
  }
}

export function normalizePncpDate(value) {
  if (typeof value !== "string") throw new Error("Date must be a string.");
  const trimmed = value.trim();
  if (/^\d{8}$/.test(trimmed)) return trimmed;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) throw new Error("Date must use YYYY-MM-DD or YYYYMMDD format.");
  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error("Date is not valid.");
  }
  return `${year}${month}${day}`;
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["data", "items", "content", "resultado", "resultados"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function extractTotalPages(payload) {
  for (const key of ["totalPaginas", "totalPages", "paginasTotais"]) {
    const value = Number(payload?.[key]);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

function normalizeLooseIdentifier(value) {
  if (value === null || value === undefined) return "";
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeContract(item) {
  return {
    pncpControlNumber: item.numeroControlePNCP ?? null,
    procurementControlNumber: item.numeroControlePNCPCompra ?? null,
    contractNumber: item.numeroContratoEmpenho ?? null,
    year: numberOrNull(item.anoContrato),
    process: item.processo ?? null,
    object: item.objetoContrato ?? null,
    supplier: {
      identifier: normalizeLooseIdentifier(item.niFornecedor) || null,
      name: item.nomeRazaoSocialFornecedor ?? null,
      personType: item.tipoPessoa ?? item.tipoPessoaFornecedor ?? null,
    },
    organization: {
      cnpj: normalizeLooseIdentifier(item.orgaoEntidade?.cnpj ?? item.cnpjOrgao ?? item.orgaoCnpj) || null,
      name: item.orgaoEntidade?.razaoSocial ?? item.nomeOrgao ?? null,
      unitName: item.unidadeOrgao?.nomeUnidade ?? item.nomeUnidade ?? null,
      state: item.unidadeOrgao?.ufSigla ?? item.ufSigla ?? null,
      city: item.unidadeOrgao?.municipioNome ?? item.municipioNome ?? null,
    },
    values: {
      initial: numberOrNull(item.valorInicial),
      global: numberOrNull(item.valorGlobal),
      installment: numberOrNull(item.valorParcela),
    },
    dates: {
      signature: item.dataAssinatura ?? null,
      publication: item.dataPublicacaoPncp ?? item.dataPublicacao ?? null,
      start: item.dataVigenciaInicio ?? null,
      end: item.dataVigenciaFim ?? null,
    },
  };
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
