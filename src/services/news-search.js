import { GdeltProvider } from '../providers/gdelt.js';
import { BingNewsRssProvider } from '../providers/bing-news-rss.js';

export class NewsSearchService {
  constructor({
    fetchFn = globalThis.fetch,
  } = {}) {
    this.gdelt = new GdeltProvider({ fetchFn });
    this.bing = new BingNewsRssProvider({ fetchFn });
  }

  async search({
    query,
    timespan = '1week',
    limit = 25,
  }) {
    const attempts = [];

    // Primary source: GDELT
    let gdelt;

    try {
      gdelt = await this.gdelt.search({
        query,
        timespan,
        limit,
      });
    } catch (error) {
      gdelt = {
        ok: false,
        provider: 'gdelt_doc',
        reason: 'exception',
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }

    if (gdelt?.ok) {
      return {
        ...gdelt,

        selectedProvider: 'gdelt_doc',
        fallbackUsed: false,

        attempts: [
          {
            provider: 'gdelt_doc',
            status: 'success',
          },
        ],
      };
    }

    attempts.push({
      provider: 'gdelt_doc',
      status: gdelt?.reason ?? 'failed',
      upstreamStatus: gdelt?.status ?? null,
    });

    // Fallback: Bing News RSS
    let bing;

    try {
      bing = await this.bing.search({
        query,
        limit,
      });
    } catch (error) {
      bing = {
        ok: false,
        provider: 'bing_news_rss',
        reason: 'exception',
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }

    if (bing?.ok) {
      return {
        ...bing,

        selectedProvider: 'bing_news_rss',
        fallbackUsed: true,

        attempts: [
          ...attempts,
          {
            provider: 'bing_news_rss',
            status: 'success',
          },
        ],
      };
    }

    attempts.push({
      provider: 'bing_news_rss',
      status: bing?.reason ?? 'failed',
      upstreamStatus: bing?.status ?? null,
    });

    return {
      ok: false,
      provider: 'news_multi_provider',
      reason: 'all_providers_failed',
      selectedProvider: null,
      fallbackUsed: true,
      attempts,
    };
  }
}
