import { clamp } from '../core/http.js';

export class WaybackProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = 'https://web.archive.org/cdx/search/cdx', commonCrawlIndexUrl = 'https://index.commoncrawl.org/collinfo.json' } = {}) {
    this.id = 'wayback_cdx'; this.fetchFn = fetchFn; this.baseUrl = baseUrl; this.commonCrawlIndexUrl = commonCrawlIndexUrl;
  }
  async history(domain, { from, to, limit = 50 } = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.set('url', `${domain}/*`);
    url.searchParams.set('output', 'json');
    url.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest');
    url.searchParams.append('filter', 'statuscode:200');
    url.searchParams.set('collapse', 'digest');
    url.searchParams.set('limit', String(clamp(limit, 1, 500, 50)));
    if (from) url.searchParams.set('from', String(from).replace(/-/g, ''));
    if (to) url.searchParams.set('to', String(to).replace(/-/g, ''));
    let response;
    try { response = await this.fetchFn(url.toString(), { headers: { accept: 'application/json', 'user-agent': 'DeltaBotsArcturianLattice/1.0' } }); }
    catch (error) { return { ok: false, provider: this.id, reason: 'network_error', detail: String(error?.message ?? error) }; }
    if (!response.ok) return this.#commonCrawl(domain, { from, to, limit, waybackStatus: response.status });
    const payload = await response.json();
    return { ok: true, provider: this.id, snapshots: normalizeCdx(payload), queryUrl: url.toString() };
  }
  async #commonCrawl(domain, { from, to, limit, waybackStatus }) {
    try {
      const indexResponse = await this.fetchFn(this.commonCrawlIndexUrl, { headers: { accept: 'application/json' } });
      if (!indexResponse.ok) return { ok: false, provider: this.id, reason: 'upstream_error', status: waybackStatus };
      const indexes = await indexResponse.json();
      const latest = Array.isArray(indexes) ? indexes.find((x) => x?.['cdx-api']) : null;
      if (!latest?.['cdx-api']) return { ok: false, provider: this.id, reason: 'fallback_unavailable', status: waybackStatus };
      const u = new URL(latest['cdx-api']);
      u.searchParams.set('url', `${domain}/*`);
      u.searchParams.set('output', 'json');
      u.searchParams.set('filter', 'status:200');
      u.searchParams.set('collapse', 'digest');
      u.searchParams.set('limit', String(clamp(limit, 1, 500, 50)));
      if (from) u.searchParams.set('from', String(from).replace(/-/g, ''));
      if (to) u.searchParams.set('to', String(to).replace(/-/g, ''));
      const r = await this.fetchFn(u.toString(), { headers: { accept: 'application/json' } });
      if (!r.ok) return { ok: false, provider: this.id, reason: 'upstream_error', status: r.status };
      const lines = (await r.text()).split('\n').map((line) => line.trim()).filter(Boolean);
      const snapshots = lines.flatMap((line) => { try { const x = JSON.parse(line); return [{ timestamp: x.timestamp ?? null, url: x.url ?? null, status: x.status ? Number(x.status) : null, mimeType: x.mime ?? null, digest: x.digest ?? null, archiveUrl: x.digest && x.timestamp && x.url ? `https://data.commoncrawl.org/${latest.id}/${x.filename ?? ''}` : null }]; } catch { return []; } });
      return { ok: true, provider: 'commoncrawl_index', fallback: true, snapshots, queryUrl: u.toString(), coverage: { complete: false, source: latest.id, waybackStatus } };
    } catch (e) { return { ok: false, provider: 'commoncrawl_index', reason: 'network_error', detail: String(e?.message ?? e), fallback: true, waybackStatus }; }
  }
}
export function normalizeCdx(payload) {
  if (!Array.isArray(payload) || payload.length < 2) return [];
  const headers = payload[0];
  return payload.slice(1).filter(Array.isArray).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null]))).map(x => ({
    timestamp: x.timestamp ?? null, url: x.original ?? null, status: x.statuscode ? Number(x.statuscode) : null, mimeType: x.mimetype ?? null, digest: x.digest ?? null,
    archiveUrl: x.timestamp && x.original ? `https://web.archive.org/web/${x.timestamp}/${x.original}` : null,
  }));
}
