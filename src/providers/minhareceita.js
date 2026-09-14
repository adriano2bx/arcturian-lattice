import { normalizeBrasilApiPayload } from './brasilapi.js';

export class MinhaReceitaCnpjProvider {
  constructor({
    fetchFn = globalThis.fetch,
    baseUrl = 'https://minhareceita.org',
  } = {}) {
    this.id = 'minhareceita';
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  supports(cnpj) {
    return /^\d{14}$/.test(cnpj);
  }

  async getProfile(cnpj) {
    if (!this.supports(cnpj)) {
      return {
        ok: false,
        provider: this.id,
        reason: 'unsupported_identifier_format',
      };
    }

    let response;

    try {
      response = await this.fetchFn(
        `${this.baseUrl}/${encodeURIComponent(cnpj)}`,
        {
          headers: {
            accept: 'application/json',
            'user-agent': 'DeltaBotsArcturianLattice/1.1',
          },
        },
      );
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: 'network_error',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        provider: this.id,
        reason:
          response.status === 404
            ? 'not_found'
            : response.status === 429
              ? 'rate_limited'
              : 'upstream_error',
        status: response.status,
      };
    }

    let data;

    try {
      data = await response.json();
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: 'invalid_json',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    return {
      ok: true,
      provider: this.id,
      profile: normalizeBrasilApiPayload(data, cnpj),
    };
  }
}
