import { clamp } from "../core/http.js";
export class SearxngProvider {
  constructor({
    fetchFn = globalThis.fetch,
    baseUrl = null,
    fallbackUrl = "https://html.duckduckgo.com/html/",
  } = {}) {
    this.id = "searxng";
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl?.replace(/\/$/, "") ?? null;
    this.fallbackUrl = fallbackUrl;
  }
  configured() {
    return Boolean(this.baseUrl);
  }
  async search({
    query,
    language = "pt-BR",
    categories = "general",
    limit = 10,
  }) {
    if (!this.configured()) return this.#duckDuckGo(query, limit);
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("language", language);
    url.searchParams.set("categories", categories);
    let r;
    try {
      r = await this.fetchFn(url.toString(), {
        headers: { accept: "application/json" },
      });
    } catch (e) {
      return {
        ok: false,
        provider: this.id,
        reason: "network_error",
        detail: String(e?.message ?? e),
      };
    }
    if (!r.ok)
      return {
        ok: false,
        provider: this.id,
        reason: "upstream_error",
        status: r.status,
      };
    const p = await r.json();
    return {
      ok: true,
      provider: this.id,
      results: (p.results ?? []).slice(0, clamp(limit, 1, 50, 10)).map((x) => ({
        title: x.title ?? null,
        url: x.url ?? null,
        content: x.content ?? null,
        engine: x.engine ?? null,
        score: x.score ?? null,
      })),
    };
  }

  async #duckDuckGo(query, limit) {
    if (!this.fallbackUrl)
      return { ok: false, provider: this.id, reason: "not_configured" };
    const url = new URL(this.fallbackUrl);
    url.searchParams.set("q", String(query));
    let response;
    try {
      response = await this.fetchFn(url.toString(), {
        headers: {
          accept: "text/html",
          "user-agent": "DeltaBotsArcturianLattice/1.1",
        },
      });
    } catch (error) {
      return {
        ok: false,
        provider: "duckduckgo_html",
        reason: "network_error",
        detail: String(error?.message ?? error),
      };
    }
    if (!response.ok)
      return {
        ok: false,
        provider: "duckduckgo_html",
        reason: "upstream_error",
        status: response.status,
      };
    const html = await response.text();
    const links = [
      ...html.matchAll(
        /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      ),
    ];
    const snippets = [
      ...html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi),
    ];
    const results = links
      .slice(0, clamp(limit, 1, 50, 10))
      .map(([, href, title], index) => ({
        title: stripHtml(title),
        url: resolveDuckUrl(href),
        content: stripHtml(snippets[index]?.[1] ?? ""),
        engine: "duckduckgo_html",
        score: null,
      }));
    return { ok: true, provider: "duckduckgo_html", fallback: true, results };
  }
}
function stripHtml(value) {
  return decodeHtml(
    String(value ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}
function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
function resolveDuckUrl(value) {
  const decoded = decodeHtml(value);
  try {
    const url = new URL(decoded, "https://duckduckgo.com");
    return url.searchParams.get("uddg")
      ? decodeURIComponent(url.searchParams.get("uddg"))
      : url.toString();
  } catch {
    return decoded;
  }
}
