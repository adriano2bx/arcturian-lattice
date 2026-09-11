export class WebHttpProvider {
  constructor({ fetchFn = globalThis.fetch } = {}) {
    this.id = "web_http";
    this.fetchFn = fetchFn;
  }

  async inspect(domain) {
    const attempts = [];
    for (const scheme of ["https", "http"]) {
      const url = `${scheme}://${domain}/`;
      let response;
      try {
        response = await this.fetchFn(url, {
          method: "GET",
          redirect: "follow",
          headers: {
            accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
            "user-agent": "NexusIntelligence/0.2 (+internal research)",
          },
        });
      } catch (error) {
        attempts.push({ url, status: "network_error", detail: String(error?.message ?? error) });
        continue;
      }

      attempts.push({ url, status: response.status });
      if (!response.ok) continue;

      const contentType = response.headers?.get?.("content-type") ?? "";
      const text = contentType.includes("text/html") || contentType.includes("application/xhtml")
        ? await response.text()
        : "";

      return {
        ok: true,
        provider: this.id,
        data: {
          requestedUrl: url,
          finalUrl: response.url || url,
          status: response.status,
          contentType: contentType || null,
          headers: selectHeaders(response.headers),
          html: extractHtmlSignals(text),
        },
        attempts,
      };
    }

    return { ok: false, provider: this.id, reason: "site_unreachable", attempts };
  }
}

export function extractHtmlSignals(html) {
  const source = String(html ?? "");
  const title = firstMatch(source, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const lang = firstMatch(source, /<html[^>]*\blang=["']?([^\s"'>]+)/i);
  const h1 = stripTags(firstMatch(source, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const description = metaContent(source, "name", "description");
  const generator = metaContent(source, "name", "generator");
  const canonical = linkHref(source, "canonical");
  const ogTitle = metaContent(source, "property", "og:title");
  const ogDescription = metaContent(source, "property", "og:description");
  const ogImage = metaContent(source, "property", "og:image");

  return {
    title: decodeBasicEntities(stripTags(title)),
    description: decodeBasicEntities(description),
    lang: lang || null,
    h1: decodeBasicEntities(h1),
    canonical: canonical || null,
    generator: generator || null,
    openGraph: {
      title: decodeBasicEntities(ogTitle),
      description: decodeBasicEntities(ogDescription),
      image: ogImage || null,
    },
  };
}

function selectHeaders(headers) {
  const keys = ["server", "via", "x-powered-by", "cf-ray", "content-security-policy", "strict-transport-security"];
  const out = {};
  for (const key of keys) {
    const value = headers?.get?.(key);
    if (value) out[key] = value;
  }
  return out;
}

function firstMatch(text, regex) {
  const match = regex.exec(text);
  return match?.[1]?.trim?.() || null;
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const a = new RegExp(`<meta[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  const b = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, "i");
  return firstMatch(html, a) ?? firstMatch(html, b);
}

function linkHref(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const a = new RegExp(`<link[^>]*rel=["'][^"']*${escaped}[^"']*["'][^>]*href=["']([^"']*)["'][^>]*>`, "i");
  const b = new RegExp(`<link[^>]*href=["']([^"']*)["'][^>]*rel=["'][^"']*${escaped}[^"']*["'][^>]*>`, "i");
  return firstMatch(html, a) ?? firstMatch(html, b);
}

function stripTags(value) {
  return value ? String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : null;
}

function decodeBasicEntities(value) {
  if (!value) return null;
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}
