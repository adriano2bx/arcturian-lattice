import { WebProfileService, normalizeDomainInput } from './web-profile.js';
import { TechnologyProvider } from '../providers/technology.js';
import { SeoAuditProvider } from '../providers/seo-audit.js';
import { WaybackProvider } from '../providers/wayback.js';
import { NewsSearchService } from './news-search.js';

export class CompetitiveService {
  constructor({ fetchFn = globalThis.fetch } = {}) {
    this.fetchFn = fetchFn;
  }

  async snapshot(domain) {
    domain = normalizeDomainInput(domain);

    const [profile, tech, seo, history, news] = await Promise.all([
      new WebProfileService({
        fetchFn: this.fetchFn,
      }).inspect(domain),

      new TechnologyProvider({
        fetchFn: this.fetchFn,
      }).detect(domain),

      new SeoAuditProvider({
        fetchFn: this.fetchFn,
      }).audit(domain),

      new WaybackProvider({
        fetchFn: this.fetchFn,
      }).history(domain, {
        limit: 20,
      }),

      new NewsSearchService({
        fetchFn: this.fetchFn,
      }).search({
        query: `domain:${domain}`,
        timespan: '3months',
        limit: 20,
      }),
    ]);

    const score = visibilityScore({
      profile,
      tech,
      seo,
      history,
      news,
    });

    return {
      domain,
      status: [profile, tech, seo, history, news].some(
        (x) => x?.ok === false || x?.status === 'failed',
      )
        ? 'partial_success'
        : 'success',
      digitalVisibilityScore: score,
      components: {
        profile,
        technology: tech,
        seo,
        history,
        news,
      },
      meta: {
        scoreType: 'derived',
        estimated: false,
        trafficEstimate: false,
      },
    };
  }

  async compare(domains) {
    const snapshots = await Promise.all(
      domains.slice(0, 5).map((d) => this.snapshot(d)),
    );

    return {
      snapshots,
      ranking: [...snapshots]
        .sort(
          (a, b) =>
            b.digitalVisibilityScore - a.digitalVisibilityScore,
        )
        .map((x, i) => ({
          rank: i + 1,
          domain: x.domain,
          score: x.digitalVisibilityScore,
        })),
    };
  }
}

export function visibilityScore({
  profile,
  tech,
  seo,
  history,
  news,
}) {
  let s = 0;

  s += Math.round((seo?.audit?.score ?? 0) * 0.55);

  if (profile?.status === 'success') {
    s += 15;
  } else if (profile?.status === 'partial_success') {
    s += 8;
  }

  s += Math.min(10, (tech?.technologies?.length ?? 0) * 2);
  s += Math.min(10, history?.snapshots?.length ?? 0);
  s += Math.min(10, news?.articles?.length ?? 0);

  return Math.max(0, Math.min(100, s));
}
