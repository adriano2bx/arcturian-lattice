import { clamp } from "../core/http.js";
export class RedditProvider {
  constructor({
    fetchFn = globalThis.fetch,
    fallbackUrl = "https://djen.2bx.com.br/search-rss",
  } = {}) {
    this.id = "reddit_public";
    this.fetchFn = fetchFn;
    this.fallbackUrl = fallbackUrl;
  }
  async search({ query, limit = 10, sort = "relevance", time = "month" }) {
    const u = new URL("https://www.reddit.com/search.json");
    u.searchParams.set("q", query);
    u.searchParams.set("limit", String(clamp(limit, 1, 50, 10)));
    u.searchParams.set("sort", sort);
    u.searchParams.set("t", time);
    let r;
    try {
      r = await this.fetchFn(u.toString(), {
        headers: {
          accept: "application/json",
          "user-agent": "DeltaBotsArcturianLattice/1.0 internal research",
        },
      });
    } catch (e) {
      return {
        ok: false,
        provider: this.id,
        reason: "network_error",
        detail: String(e?.message ?? e),
      };
    }
    if (r.ok) {
      const p = await r.json();
      return {
        ok: true,
        provider: this.id,
        posts: (p?.data?.children ?? [])
          .map((x) => x.data)
          .map((x) => ({
            id: x.id,
            title: x.title,
            subreddit: x.subreddit,
            author: x.author,
            score: x.score,
            numComments: x.num_comments,
            createdUtc: x.created_utc,
            url: x.url,
            permalink: x.permalink
              ? `https://www.reddit.com${x.permalink}`
              : null,
            selftext: x.selftext?.slice?.(0, 4000) ?? null,
          })),
      };
    }
    if (r.status !== 403 || !this.fallbackUrl)
      return {
        ok: false,
        provider: this.id,
        reason: "upstream_error",
        status: r.status,
      };
    const fallback = new URL(this.fallbackUrl);
    fallback.searchParams.set("q", `site:reddit.com ${query}`);
    try {
      const fr = await this.fetchFn(fallback.toString(), {
        headers: { accept: "application/rss+xml" },
      });
      if (!fr.ok)
        return {
          ok: false,
          provider: this.id,
          reason: "upstream_error",
          status: fr.status,
        };
      const xml = await fr.text();
      const posts = [
        ...xml.matchAll(
          /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/gi,
        ),
      ]
        .filter(([, , url]) =>
          /(^|\/\/)(www\.|old\.)?reddit\.com\//i.test(decode(url)),
        )
        .slice(0, clamp(limit, 1, 50, 10))
        .map(([, title, url, selftext], i) => ({
          id: `bing-${i}`,
          title: decode(title),
          subreddit: null,
          author: null,
          score: null,
          numComments: null,
          createdUtc: null,
          url: decode(url).trim(),
          permalink: decode(url).trim(),
          selftext: decode(selftext),
        }));
      return {
        ok: true,
        provider: "reddit_indexed_search",
        fallback: true,
        posts,
      };
    } catch (e) {
      return {
        ok: false,
        provider: "reddit_indexed_search",
        reason: "network_error",
        detail: String(e?.message ?? e),
      };
    }
  }
}
function decode(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}
