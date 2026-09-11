export class RdapProvider {
  constructor({
    fetchFn = globalThis.fetch,
    bootstrapUrl = "https://data.iana.org/rdap/dns.json",
  } = {}) {
    this.id = "rdap_iana";
    this.fetchFn = fetchFn;
    this.bootstrapUrl = bootstrapUrl;
    this.bootstrapCache = null;
  }

  async domain(domain) {
    const tld = String(domain).toLowerCase().split(".").pop();
    if (!tld) return { ok: false, provider: this.id, reason: "invalid_domain" };

    let bootstrap;
    try {
      bootstrap = await this.getBootstrap();
    } catch (error) {
      return { ok: false, provider: this.id, reason: "bootstrap_error", detail: String(error?.message ?? error) };
    }

    const baseUrl = findServiceUrl(bootstrap, tld);
    if (!baseUrl) return { ok: false, provider: this.id, reason: "tld_not_found" };

    let response;
    try {
      response = await this.fetchFn(`${baseUrl.replace(/\/$/, "")}/domain/${encodeURIComponent(domain)}`, {
        headers: { accept: "application/rdap+json, application/json" },
      });
    } catch (error) {
      return { ok: false, provider: this.id, reason: "network_error", detail: String(error?.message ?? error) };
    }
    if (!response.ok) {
      return { ok: false, provider: this.id, reason: response.status === 404 ? "not_found" : "upstream_error", status: response.status };
    }

    const data = await response.json();
    return { ok: true, provider: this.id, data: normalizeRdap(data) };
  }

  async getBootstrap() {
    if (this.bootstrapCache) return this.bootstrapCache;
    const response = await this.fetchFn(this.bootstrapUrl, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`IANA RDAP bootstrap returned HTTP ${response.status}.`);
    this.bootstrapCache = await response.json();
    return this.bootstrapCache;
  }
}

export function findServiceUrl(bootstrap, tld) {
  for (const service of bootstrap?.services ?? []) {
    const labels = Array.isArray(service?.[0]) ? service[0] : [];
    const urls = Array.isArray(service?.[1]) ? service[1] : [];
    if (labels.map((x) => String(x).toLowerCase()).includes(String(tld).toLowerCase())) return urls[0] ?? null;
  }
  return null;
}

export function normalizeRdap(data) {
  const events = Array.isArray(data?.events) ? data.events : [];
  return {
    handle: data?.handle ?? null,
    ldhName: data?.ldhName ?? null,
    unicodeName: data?.unicodeName ?? null,
    status: Array.isArray(data?.status) ? data.status : [],
    events: Object.fromEntries(events.filter((event) => event?.eventAction).map((event) => [event.eventAction, event.eventDate ?? null])),
    nameservers: Array.isArray(data?.nameservers)
      ? data.nameservers.map((ns) => ns.ldhName ?? ns.unicodeName).filter(Boolean)
      : [],
    entities: Array.isArray(data?.entities)
      ? data.entities.map((entity) => ({
          handle: entity.handle ?? null,
          roles: Array.isArray(entity.roles) ? entity.roles : [],
          publicIds: Array.isArray(entity.publicIds) ? entity.publicIds : [],
        }))
      : [],
    port43: data?.port43 ?? null,
    secureDns: data?.secureDNS ?? null,
  };
}
