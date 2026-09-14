export class SeoAuditProvider {
  constructor({ fetchFn = globalThis.fetch } = {}) { this.id = 'seo_observer'; this.fetchFn = fetchFn; }
  async audit(input) {
    const url = normalizeUrl(input);
    let response;
    try { response = await this.fetchFn(url, { redirect: 'follow', headers: { accept: 'text/html,*/*;q=0.1', 'user-agent': 'DeltaBotsArcturianLattice/1.0' } }); }
    catch (error) { return { ok: false, provider: this.id, reason: 'network_error', detail: String(error?.message ?? error) }; }
    if (!response.ok) return { ok: false, provider: this.id, reason: 'upstream_error', status: response.status };
    const html = await response.text();
    return { ok: true, provider: this.id, audit: auditHtml(html, response, url) };
  }
}
export function auditHtml(html, response = {}, url = null) {
  const title = match1(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = meta(html, 'description');
  const canonical = match1(html, /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)/i) ?? match1(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical/i);
  const robots = meta(html, 'robots');
  const h1s = [...String(html).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => strip(m[1]));
  const links = [...String(html).matchAll(/<a\b[^>]+href=["']([^"'#]+)["']/gi)].map(m => m[1]);
  const imgs = [...String(html).matchAll(/<img\b([^>]*)>/gi)].map(m => m[1]);
  const missingAlt = imgs.filter(attrs => !/\balt=["'][^"']*["']/i.test(attrs)).length;
  const jsonLd = [...String(html).matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].length;
  const scoreParts = [Boolean(title && title.length >= 10 && title.length <= 65), Boolean(description && description.length >= 50 && description.length <= 180), h1s.length === 1, Boolean(canonical), missingAlt === 0, jsonLd > 0, Boolean(response?.headers?.get?.('strict-transport-security'))];
  const score = Math.round(scoreParts.filter(Boolean).length / scoreParts.length * 100);
  return {
    url, status: response?.status ?? null, score,
    title: { value: strip(title), length: strip(title)?.length ?? 0 }, description: { value: description, length: description?.length ?? 0 },
    canonical, robots, headings: { h1Count: h1s.length, h1: h1s.slice(0, 10) },
    links: { count: links.length }, images: { count: imgs.length, missingAlt }, structuredDataBlocks: jsonLd,
    security: { hsts: Boolean(response?.headers?.get?.('strict-transport-security')) }, bytes: new TextEncoder().encode(String(html)).length,
    issues: [
      ...(!title ? ['missing_title'] : []), ...(title && title.length > 65 ? ['title_too_long'] : []), ...(!description ? ['missing_meta_description'] : []),
      ...(h1s.length === 0 ? ['missing_h1'] : []), ...(h1s.length > 1 ? ['multiple_h1'] : []), ...(!canonical ? ['missing_canonical'] : []),
      ...(missingAlt ? [`images_missing_alt:${missingAlt}`] : []), ...(!jsonLd ? ['missing_structured_data'] : []),
    ],
  };
}
function normalizeUrl(v) { let s=String(v??'').trim(); if(!/^https?:\/\//i.test(s)) s=`https://${s}`; return new URL(s).toString(); }
function match1(s,re){ return re.exec(String(s??''))?.[1]?.trim?.() ?? null; }
function meta(html,name){ const re1=new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`,`i`); const re2=new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`,`i`); return match1(html,re1)??match1(html,re2); }
function strip(s){ return s ? String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() : null; }
