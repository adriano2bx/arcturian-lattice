export class DnsDohProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = "https://cloudflare-dns.com/dns-query" } = {}) {
    this.id = "cloudflare_doh";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl;
  }

  async lookup(domain, types = ["A", "AAAA", "MX", "NS"]) {
    const results = await Promise.all(types.map((type) => this.lookupType(domain, type)));
    const ok = results.some((result) => result.ok);
    return {
      ok,
      provider: this.id,
      records: Object.fromEntries(results.map((result) => [result.type, result.records ?? []])),
      attempts: results.map(({ type, ok: itemOk, status, reason }) => ({ type, ok: itemOk, status, reason })),
    };
  }

  async lookupType(domain, type) {
    const url = new URL(this.baseUrl);
    url.searchParams.set("name", domain);
    url.searchParams.set("type", type);

    let response;
    try {
      response = await this.fetchFn(url.toString(), { headers: { accept: "application/dns-json" } });
    } catch (error) {
      return { type, ok: false, reason: "network_error", detail: String(error?.message ?? error) };
    }
    if (!response.ok) return { type, ok: false, reason: "upstream_error", status: response.status };

    const payload = await response.json();
    const answers = Array.isArray(payload?.Answer) ? payload.Answer : [];
    return {
      type,
      ok: true,
      status: payload?.Status ?? 0,
      records: answers.map((answer) => ({
        name: answer.name ?? null,
        type: answer.type ?? null,
        ttl: answer.TTL ?? null,
        data: answer.data ?? null,
      })),
    };
  }
}
