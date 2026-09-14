import { clamp } from '../core/http.js';

export class BingNewsRssProvider {
  constructor({
    fetchFn = globalThis.fetch,
    baseUrl = 'https://www.bing.com/news/search',
  } = {}) {
    this.id = 'bing_news_rss';
    this.fetchFn = fetchFn;
    this.baseUrl = baseUrl;
  }

  async search({ query, limit = 25 }) {
    const url = new URL(this.baseUrl);

    url.searchParams.set('q', query);
    url.searchParams.set('format', 'RSS');

    let response;

    try {
      response = await this.fetchFn(url.toString(), {
        redirect: 'follow',
        headers: {
          accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1',
          'user-agent': 'DeltaBotsArcturianLattice/1.1',
        },
      });
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: 'network_error',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        provider: this.id,
        reason:
          response.status === 429
            ? 'rate_limited'
            : 'upstream_error',
        status: response.status,
      };
    }

    let xml;

    try {
      xml = await response.text();
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: 'invalid_response',
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const max = clamp(limit, 1, 100, 25);

    const items = [
      ...String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi),
    ]
      .slice(0, max)
      .map((match) => parseItem(match[1]))
      .filter((item) => item.title || item.url);

    return {
      ok: true,
      provider: this.id,
      articles: items,
    };
  }
}

function parseItem(xml) {
  const rawLink = extractTag(xml, 'link');

  return {
    url: unwrapBingUrl(rawLink),
    title: extractTag(xml, 'title'),
    seendate: extractTag(xml, 'pubDate'),
    domain: domainFromUrl(unwrapBingUrl(rawLink)),
    language: null,
    sourceCountry: null,
    socialImage:
      extractTag(xml, 'News:Image') ??
      extractTag(xml, 'image'),
    source:
      extractTag(xml, 'News:Source') ??
      extractTag(xml, 'source'),
    description: stripHtml(
      extractTag(xml, 'description'),
    ),
  };
}

function extractTag(xml, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const match = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
    'i',
  ).exec(String(xml ?? ''));

  if (!match) return null;

  return decodeXml(
    stripCdata(match[1]).trim(),
  );
}

function stripCdata(value) {
  return String(value ?? '')
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '');
}

function decodeXml(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value) {
  if (!value) return null;

  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unwrapBingUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    const embedded = url.searchParams.get('url');

    if (embedded) {
      try {
        return decodeURIComponent(embedded);
      } catch {
        return embedded;
      }
    }

    return url.toString();
  } catch {
    return value;
  }
}

function domainFromUrl(value) {
  if (!value) return null;

  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
