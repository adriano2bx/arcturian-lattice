import { clamp } from '../core/http.js';

export class WaybackProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = 'https://web.archive.org/cdx/search/cdx' } = {}) {
    this.id = 'wayback_cdx'; this.fetchFn = fetchFn; this.baseUrl = baseUrl;
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
    try { response = await this.fetchFn(url.toString(), { headers: { accept: 'application/json', 'user-agent': 'NexusIntelligence/1.0' } }); }
    catch (error) { return { ok: false, provider: this.id, reason: 'network_error', detail: String(error?.message ?? error) }; }
    if (!response.ok) return { ok: false, provider: this.id, reason: 'upstream_error', status: response.status };
    const payload = await response.json();
    return { ok: true, provider: this.id, snapshots: normalizeCdx(payload), queryUrl: url.toString() };
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
