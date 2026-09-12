import { normalizeCnpj } from "../core/cnpj.js";

export class TcuCertificatesProvider {
  constructor({
    fetchFn = globalThis.fetch,
    baseUrl = "https://certidoes-apf.apps.tcu.gov.br/api/rest/publico",
  } = {}) {
    this.id = "tcu_consolidated_certificates";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  supports(cnpj) {
    return /^\d{14}$/.test(cnpj);
  }

  async check(cnpj) {
    const normalized = normalizeCnpj(cnpj);
    if (!this.supports(normalized)) {
      return {
        ok: false,
        provider: this.id,
        reason: "unsupported_identifier_format",
      };
    }

    let response;
    try {
      response = await this.fetchFn(
        `${this.baseUrl}/certidoes/${encodeURIComponent(normalized)}?seEmitirPDF=false`,
        { headers: { accept: "application/json" } },
      );
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: "network_error",
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        provider: this.id,
        reason: response.status === 404 ? "not_found" : "upstream_error",
        status: response.status,
      };
    }

    const payload = await response.json();
    const certificates = Array.isArray(payload.certidoes)
      ? payload.certidoes.map(normalizeCertificate)
      : [];

    return {
      ok: true,
      provider: this.id,
      data: {
        company: {
          cnpj: normalizeLooseIdentifier(payload.cnpj) || normalized,
          legalName: payload.razaoSocial ?? null,
          tradeName: payload.nomeFantasia ?? null,
          state: payload.uf ?? null,
        },
        certificates,
        summary: summarizeCertificates(certificates),
      },
    };
  }
}

export function normalizeCertificate(cert) {
  return {
    issuer: cert.emissor ?? null,
    type: cert.tipo ?? null,
    issuedAt: cert.dataHoraEmissao ?? null,
    description: cert.descricao ?? null,
    status: cert.situacao ?? null,
    observation: cert.observacao ?? null,
  };
}

export function summarizeCertificates(certificates) {
  const clearPatterns = [
    /NADA\s+CONSTA/i,
    /N[AÃ]O\s+CONSTA/i,
    /REGULAR/i,
    /NEGATIV[AO]/i,
    /SEM\s+REGISTRO/i,
  ];

  let clear = 0;
  let reviewRequired = 0;
  for (const cert of certificates) {
    const status = `${cert.status ?? ""} ${cert.description ?? ""}`   .replace(/[_-]+/g, " ")   .replace(/\s+/g, " ")   .trim();
    if (clearPatterns.some((pattern) => pattern.test(status))) clear += 1;
    else reviewRequired += 1;
  }

  return {
    total: certificates.length,
    clear,
    reviewRequired,
    interpretation:
      reviewRequired === 0
        ? "No non-clear status was detected by the conservative text classifier. Review source records for legal decisions."
        : "One or more certificate statuses require human/legal review; this is not a legal conclusion.",
  };
}

function normalizeLooseIdentifier(value) {
  if (value === null || value === undefined) return "";
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}
