export class TechnologyProvider {
  constructor({ fetchFn = globalThis.fetch } = {}) { this.id = 'technology_fingerprint'; this.fetchFn = fetchFn; }
  async detect(domain) {
    let response;
    try { response = await this.fetchFn(`https://${domain}/`, { redirect: 'follow', headers: { accept: 'text/html,*/*;q=0.1', 'user-agent': 'NexusIntelligence/1.0' } }); }
    catch (error) { return { ok: false, provider: this.id, reason: 'network_error', detail: String(error?.message ?? error) }; }
    if (!response.ok) return { ok: false, provider: this.id, reason: 'upstream_error', status: response.status };
    const html = await response.text();
    return { ok: true, provider: this.id, technologies: detectTechnologies(html, response.headers), evidence: basicEvidence(html, response.headers) };
  }
}

const signatures = [
  ['WordPress', /wp-content|wp-includes|wordpress/i], ['WooCommerce', /woocommerce/i], ['Shopify', /cdn\.shopify\.com|Shopify\.theme/i],
  ['Webflow', /webflow\.com|data-wf-page/i], ['Wix', /wixstatic\.com|X-Wix-/i], ['Next.js', /__NEXT_DATA__|_next\/static/i],
  ['Nuxt', /__NUXT__|_nuxt\//i], ['React', /react(?:\.production)?\.min\.js|data-reactroot/i], ['Vue.js', /vue(?:\.global)?(?:\.prod)?\.js|data-v-/i],
  ['Angular', /ng-version|angular\.min\.js/i], ['Google Analytics', /googletagmanager\.com\/gtag|google-analytics\.com/i],
  ['Google Tag Manager', /googletagmanager\.com\/gtm\.js/i], ['Meta Pixel', /connect\.facebook\.net\/.*fbevents\.js|fbq\(/i],
  ['Hotjar', /static\.hotjar\.com|hj\(/i], ['HubSpot', /js\.hs-scripts\.com|hubspot/i], ['RD Station', /rdstation|rd\.station/i],
  ['Typebot', /typebot/i], ['Chatwoot', /chatwoot/i], ['Cloudflare', /cloudflare|cf-ray/i], ['Vercel', /vercel/i],
];
export function detectTechnologies(html, headers) {
  const headerText = [...(headers?.entries?.() ?? [])].map(([k,v]) => `${k}:${v}`).join('\n');
  const haystack = `${html}\n${headerText}`;
  return signatures.filter(([, re]) => re.test(haystack)).map(([name]) => name);
}
function basicEvidence(html, headers) {
  return { generator: (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1] ?? null), server: headers?.get?.('server') ?? null, poweredBy: headers?.get?.('x-powered-by') ?? null };
}
