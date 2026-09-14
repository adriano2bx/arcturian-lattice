export class NominatimProvider {
  constructor({
    fetchFn = globalThis.fetch,
    baseUrl = null,
    fallbackUrl = "https://photon.komoot.io/api/",
  } = {}) {
    this.id = "nominatim";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl?.replace(/\/$/, "") ?? null;
    this.fallbackUrl = fallbackUrl;
  }
  async search({ query, limit = 10, countrycodes = null }) {
    const capped = Math.min(50, Math.max(1, Number(limit) || 10));
    const u = this.baseUrl
      ? new URL(`${this.baseUrl}/search`)
      : new URL(this.fallbackUrl);
    u.searchParams.set("q", query);
    if (this.baseUrl) {
      u.searchParams.set("format", "jsonv2");
      u.searchParams.set("addressdetails", "1");
      u.searchParams.set("limit", String(capped));
      if (countrycodes) u.searchParams.set("countrycodes", countrycodes);
    } else {
      u.searchParams.set("limit", String(capped));
    }
    let r;
    try {
      r = await this.fetchFn(u.toString(), {
        headers: {
          accept: "application/json",
          "user-agent": "DeltaBotsArcturianLattice/1.0",
        },
      });
    } catch (e) {
      return {
        ok: false,
        provider: this.baseUrl ? "nominatim" : "photon",
        reason: "network_error",
        detail: String(e?.message ?? e),
      };
    }
    if (!r.ok)
      return {
        ok: false,
        provider: this.baseUrl ? "nominatim" : "photon",
        reason: "upstream_error",
        status: r.status,
      };
    const body = await r.json();
    return {
      ok: true,
      provider: this.baseUrl ? "nominatim" : "photon",
      fallback: !this.baseUrl,
      results: this.baseUrl
        ? body
        : (body?.features ?? []).map((x) => ({
            lat: x.geometry?.coordinates?.[1] ?? null,
            lon: x.geometry?.coordinates?.[0] ?? null,
            display_name: x.properties?.name ?? x.properties?.city ?? null,
            address: x.properties ?? {},
            type: x.properties?.type ?? null,
          })),
    };
  }
}
