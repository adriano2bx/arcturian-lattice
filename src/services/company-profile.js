import { describeCnpj } from "../core/cnpj.js";

export class CompanyProfileError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "CompanyProfileError";
    this.code = code;
    this.details = details;
  }
}

export class CompanyProfileService {
  constructor({ providers = [], now = () => new Date() } = {}) {
    this.providers = providers;
    this.now = now;
  }

  async getByCnpj(input) {
    const document = describeCnpj(input);
    if (!document.valid) {
      throw new CompanyProfileError("CNPJ check digits are invalid.", "INVALID_CNPJ", {
        document,
      });
    }

    const attempts = [];
    for (const provider of this.providers) {
      if (!provider.supports(document.normalized)) {
        attempts.push({ provider: provider.id, status: "unsupported" });
        continue;
      }

      const result = await provider.getProfile(document.normalized);
      if (result.ok) {
        return {
          ...result.profile,
          document: {
            ...result.profile.document,
            ...document,
          },
          meta: {
            sourceType: "public_api",
            source: result.provider,
            observedAt: this.now().toISOString(),
            confidence: 0.9,
            estimated: false,
            attempts: [...attempts, { provider: result.provider, status: "success" }],
          },
        };
      }

      attempts.push({
        provider: result.provider,
        status: result.reason,
        upstreamStatus: result.status ?? null,
      });
    }

    const hasSupportingProvider = this.providers.some((provider) => provider.supports(document.normalized));
    throw new CompanyProfileError(
      hasSupportingProvider
        ? "No company data provider returned a successful profile."
        : "No configured provider supports this CNPJ format yet.",
      hasSupportingProvider ? "PROVIDER_FAILURE" : "NO_PROVIDER_FOR_FORMAT",
      { document, attempts },
    );
  }
}
