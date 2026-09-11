import { WebHttpProvider } from "../providers/web-http.js";
import { DnsDohProvider } from "../providers/dns-doh.js";
import { RdapProvider } from "../providers/rdap.js";

export class WebProfileService {
  constructor({ fetchFn = globalThis.fetch, httpProvider, dnsProvider, rdapProvider } = {}) {
    this.httpProvider = httpProvider ?? new WebHttpProvider({ fetchFn });
    this.dnsProvider = dnsProvider ?? new DnsDohProvider({ fetchFn });
    this.rdapProvider = rdapProvider ?? new RdapProvider({ fetchFn });
  }

  async inspect(input) {
    const domain = normalizeDomainInput(input);
    const [http, dns, rdap] = await Promise.all([
      this.httpProvider.inspect(domain),
      this.dnsProvider.lookup(domain),
      this.rdapProvider.domain(domain),
    ]);

    const successes = [http, dns, rdap].filter((item) => item?.ok).length;
    return {
      domain,
      status: successes === 3 ? "success" : successes > 0 ? "partial_success" : "failed",
      website: http.ok ? http.data : null,
      dns: dns.ok ? dns.records : null,
      registration: rdap.ok ? rdap.data : null,
      sources: [
        sourceMeta(http, "observed", "HTTP(S)"),
        sourceMeta(dns, "observed", "DNS over HTTPS"),
        sourceMeta(rdap, "official_registry_protocol", "RDAP/IANA bootstrap"),
      ],
      warnings: [http, dns, rdap]
        .filter((item) => !item?.ok)
        .map((item) => ({ provider: item?.provider ?? "unknown", reason: item?.reason ?? "unknown" })),
    };
  }
}

export function normalizeDomainInput(input) {
  let text = String(input ?? "").trim();
  if (!text) throw new Error("domain or URL is required.");
  if (!/^https?:\/\//i.test(text)) text = `https://${text}`;
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error("Invalid domain or URL.");
  }
  const domain = url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  if (!domain || !domain.includes(".")) throw new Error("A registrable-looking domain is required.");
  return domain;
}

function sourceMeta(result, sourceType, source) {
  return {
    provider: result?.provider ?? "unknown",
    sourceType,
    source,
    ok: Boolean(result?.ok),
    estimated: false,
    confidence: result?.ok ? 0.95 : 0,
  };
}
