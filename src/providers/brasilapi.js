/**
 * Bootstrap provider for legacy numeric CNPJs.
 * BrasilAPI's current public contract documents a 14-digit numeric parameter,
 * so this provider deliberately refuses alphanumeric identifiers.
 */
export class BrasilApiCnpjProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = "https://brasilapi.com.br/api/cnpj/v1" } = {}) {
    this.id = "brasilapi";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  supports(cnpj) {
    return /^\d{14}$/.test(cnpj);
  }

  async getProfile(cnpj) {
    if (!this.supports(cnpj)) {
      return {
        ok: false,
        provider: this.id,
        reason: "unsupported_identifier_format",
      };
    }

    let response;
    try {
      response = await this.fetchFn(`${this.baseUrl}/${encodeURIComponent(cnpj)}`, {
        headers: { accept: "application/json" },
      });
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

    const data = await response.json();
    return {
      ok: true,
      provider: this.id,
      profile: normalizeBrasilApiPayload(data, cnpj),
    };
  }
}

export function normalizeBrasilApiPayload(data, fallbackCnpj) {
  const secondary = Array.isArray(data.cnaes_secundarios)
    ? data.cnaes_secundarios
    : Array.isArray(data.atividades_secundarias)
      ? data.atividades_secundarias
      : [];

  const partners = Array.isArray(data.qsa) ? data.qsa : [];

  return {
    document: {
      cnpj: String(data.cnpj ?? fallbackCnpj).replace(/[^A-Z0-9]/gi, "").toUpperCase(),
    },
    identity: {
      legalName: data.razao_social ?? data.nome ?? null,
      tradeName: data.nome_fantasia ?? data.fantasia ?? null,
      status: data.descricao_situacao_cadastral ?? data.situacao ?? null,
      openedAt: data.data_inicio_atividade ?? data.abertura ?? null,
      legalNature: data.natureza_juridica ?? null,
      size: data.porte ?? null,
      shareCapital: numberOrNull(data.capital_social),
      headquarters: data.descricao_identificador_matriz_filial ?? data.tipo ?? null,
    },
    address: {
      street: data.logradouro ?? null,
      number: data.numero ?? null,
      complement: data.complemento ?? null,
      district: data.bairro ?? null,
      city: data.municipio ?? data.municipio_nome ?? null,
      state: data.uf ?? null,
      postalCode: data.cep ?? null,
      country: "BR",
    },
    contacts: {
      email: data.email ?? null,
      phone: data.ddd_telefone_1 ?? data.telefone ?? null,
      phone2: data.ddd_telefone_2 ?? null,
    },
    activities: {
      primary: data.cnae_fiscal
        ? {
            code: String(data.cnae_fiscal),
            description: data.cnae_fiscal_descricao ?? null,
          }
        : Array.isArray(data.atividade_principal) && data.atividade_principal[0]
          ? {
              code: data.atividade_principal[0].code ?? null,
              description: data.atividade_principal[0].text ?? null,
            }
          : null,
      secondary: secondary.map((item) => ({
        code: item.codigo ?? item.code ?? null,
        description: item.descricao ?? item.text ?? null,
      })),
    },
    partners: partners.map((partner) => ({
      name: partner.nome_socio ?? partner.nome ?? null,
      role: partner.qualificacao_socio ?? partner.qual ?? null,
      country: partner.pais ?? null,
      legalRepresentative: partner.nome_representante_legal ?? null,
    })),
  };
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
