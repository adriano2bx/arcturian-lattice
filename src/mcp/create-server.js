import { NewsSearchService } from '../services/news-search.js';
import { MinhaReceitaCnpjProvider } from '../providers/minhareceita.js';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { describeCnpj } from '../core/cnpj.js';
import { BrasilApiCnpjProvider } from '../providers/brasilapi.js';
import {
  CompanyProfileService,
  CompanyProfileError,
} from '../services/company-profile.js';
import { PncpContractsProvider } from '../providers/pncp-contracts.js';
import { TcuCertificatesProvider } from '../providers/tcu-certificates.js';
import { JudiciarioMcpProvider } from '../providers/judiciario-mcp.js';
import { InpiLocalProvider } from '../providers/inpi-local.js';
import { WebProfileService } from '../services/web-profile.js';
import { WaybackProvider } from '../providers/wayback.js';
import { TechnologyProvider } from '../providers/technology.js';
import { SeoAuditProvider } from '../providers/seo-audit.js';
import { SearxngProvider } from '../providers/searxng.js';
import { LinkGraphLocalProvider } from '../providers/link-graph-local.js';
import { OpenAlexProvider } from '../providers/openalex.js';
import { CrossrefProvider } from '../providers/crossref.js';
import { QueridoDiarioProvider } from '../providers/querido-diario.js';
import { GleifProvider } from '../providers/gleif.js';
import { OpenMeteoProvider } from '../providers/openmeteo.js';
import { YouTubeProvider } from '../providers/youtube.js';
import { RedditProvider } from '../providers/reddit.js';
import { BcbProvider } from '../providers/bcb.js';
import { SecProvider } from '../providers/sec.js';
import { CryptoProvider } from '../providers/crypto.js';
import { IbgeSidraProvider } from '../providers/ibge-sidra.js';
import { CompanyOsintService } from '../services/company-osint.js';
import { CompetitiveService } from '../services/competitive.js';
import { MonitorService } from '../services/monitor.js';
import { TrafficEstimatorService } from '../services/traffic-estimator.js';
import {
  RipeStatProvider,
  PeeringDbProvider,
} from '../providers/network-intel.js';
import { CertificateTransparencyProvider } from '../providers/certificate-transparency.js';
import { NominatimProvider } from '../providers/nominatim.js';
import { OpenDataLocalProvider } from '../providers/open-data-local.js';
import { SitemapProvider } from '../providers/sitemap.js';
import { AnatelSyncService } from '../services/anatel-sync.js';

export const ARCTURIAN_VERSION = '1.1.0';

export function createArcturianLatticeMcpServer({
  env = {},
  fetchFn = globalThis.fetch,
} = {}) {
  const server = new McpServer({
    name: 'arcturian-lattice',
    version: ARCTURIAN_VERSION,
  });

  const searx = () =>
    new SearxngProvider({
      fetchFn,
      baseUrl: env.SEARXNG_URL ?? null,
    });

  const youtube = () =>
    new YouTubeProvider({
      fetchFn,
      transcriptBaseUrl:
        env.YOUTUBE_TRANSCRIPT_URL ?? null,
      allowKomeFallback:
        boolEnv(env.ALLOW_KOME_FALLBACK),
    });

  tool(
    server,
    'company.validate_cnpj',
    'Validate and normalize Brazilian numeric or alphanumeric CNPJ.',
    {
      cnpj: z.string().min(1),
    },
    async ({ cnpj }) => describeCnpj(cnpj),
  );

  tool(
    server,
    'company.profile',
    'Normalized Brazilian company profile by CNPJ with provider provenance.',
    {
      cnpj: z.string().min(1),
    },
    async ({ cnpj }) => {
      const service = new CompanyProfileService({
        providers: [
          new BrasilApiCnpjProvider({
            fetchFn,
          }),
          new MinhaReceitaCnpjProvider({
            fetchFn,
          }),
        ],
      });

      try {
        return await service.getByCnpj(cnpj);
      } catch (error) {
        if (
          error instanceof CompanyProfileError
        ) {
          return fail(
            error.code,
            error.message,
            error.details,
          );
        }

        throw error;
      }
    },
  );

  tool(
    server,
    'company.public_contracts',
    'Search official PNCP contracts related to a company.',
    {
      cnpj: z.string().min(1),
      role: z
        .enum([
          'supplier',
          'organization',
        ])
        .default('supplier'),
      dateFrom: z.string(),
      dateTo: z.string(),
      maxPages: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5),
    },
    async (a) => ({
      ...(await new PncpContractsProvider({
        fetchFn,
      }).searchContracts(a)),
      meta: official('PNCP'),
    }),
  );

  tool(
    server,
    'company.risk',
    'Official public-integrity screening using TCU consolidated certificates; no legal conclusion is inferred.',
    {
      cnpj: z.string().min(1),
    },
    async ({ cnpj }) => {
      const d = describeCnpj(cnpj);

      if (!d.valid) {
        return fail(
          'INVALID_CNPJ',
          'CNPJ check digits are invalid.',
          d,
        );
      }

      return {
        ...(await new TcuCertificatesProvider({
          fetchFn,
        }).check(d.normalized)),
        meta: {
          ...official(
            'TCU Consulta Consolidada',
          ),
          legalConclusion: false,
        },
      };
    },
  );

  tool(
    server,
    'company.legal',
    'Search public judicial publication signals through the internal Judiciario BR MCP.',
    {
      cnpj: z.string().min(1),
      legalName: z
        .string()
        .min(2)
        .optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      tribunal: z.string().optional(),
      page: z
        .number()
        .int()
        .min(1)
        .default(1),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(20),
    },
    async ({
      cnpj,
      legalName,
      dateFrom,
      dateTo,
      tribunal,
      page,
      pageSize,
    }) => {
      const d = describeCnpj(cnpj);

      if (!d.valid) {
        return fail(
          'INVALID_CNPJ',
          'CNPJ check digits are invalid.',
          d,
        );
      }

      let name = legalName ?? null;

      if (!name) {
        try {
          name = (
            await new CompanyProfileService({
              providers: [
                new BrasilApiCnpjProvider({
                  fetchFn,
                }),
                new MinhaReceitaCnpjProvider({
                  fetchFn,
                }),
              ],
            }).getByCnpj(d.normalized)
          ).identity?.legalName ?? null;
        } catch {}
      }

      if (!name) {
        return fail(
          'LEGAL_NAME_REQUIRED',
          'Could not resolve legal name; pass legalName explicitly.',
        );
      }

      const p =
        new JudiciarioMcpProvider({
          fetchFn,
          endpoint:
            env.JUDICIARIO_MCP_URL ??
            null,
          bearerToken:
            env.JUDICIARIO_BEARER_TOKEN ??
            null,
        });

      return {
        ...(await p.searchByParty({
          name,
          dateFrom,
          dateTo,
          tribunal,
          page,
          pageSize,
        })),
        company: {
          cnpj: d.normalized,
          legalName: name,
        },
        meta: {
          source:
            'Judiciario BR / DJEN-CNJ',
          sourceType:
            'internal_mcp_over_public_data',
          estimated: false,
          legalConclusion: false,
        },
      };
    },
  );

  tool(
    server,
    'company.ip',
    'Search a local D1 mirror of official INPI intellectual-property data.',
    {
      cnpj: z.string().min(1),
      legalName: z
        .string()
        .min(2)
        .optional(),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(100),
    },
    async ({
      cnpj,
      legalName,
      limit,
    }) => {
      const d = describeCnpj(cnpj);

      if (!d.valid) {
        return fail(
          'INVALID_CNPJ',
          'CNPJ check digits are invalid.',
          d,
        );
      }

      return {
        ...(await new InpiLocalProvider({
          db: env.DB ?? null,
        }).searchByCompany({
          cnpj: d.normalized,
          legalName,
          limit,
        })),
        meta: {
          source: 'INPI local mirror',
          sourceType:
            'official_dataset_mirror',
          estimated: false,
        },
      };
    },
  );

  tool(
    server,
    'company.gazette',
    'Get company and partner data exposed by the open Querido Diario API, with current-company identity cross-check.',
    {
      cnpj: z.string().min(1),
    },
    async ({ cnpj }) => {
      const d = describeCnpj(cnpj);

      if (!d.valid) {
        return fail(
          'INVALID_CNPJ',
          'CNPJ check digits are invalid.',
          d,
        );
      }

      const q =
        new QueridoDiarioProvider({
          fetchFn,
        });

      const profileService =
        new CompanyProfileService({
          providers: [
            new BrasilApiCnpjProvider({
              fetchFn,
            }),
            new MinhaReceitaCnpjProvider({
              fetchFn,
            }),
          ],
        });

      const [
        company,
        partners,
        currentProfile,
      ] = await Promise.all([
        q.company(d.normalized),
        q.partners(d.normalized),

        profileService
          .getByCnpj(d.normalized)
          .catch(() => null),
      ]);

      const companyOk =
        company?.ok === true;

      const partnersOk =
        partners?.ok === true;

      const upstreamLegalName =
        company?.data?.cnpj_info
          ?.razao_social ?? null;

      const currentLegalName =
        currentProfile?.identity
          ?.legalName ?? null;

      const normalizeName = (value) =>
        String(value ?? '')
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            '',
          )
          .replace(
            /[^A-Z0-9]/gi,
            '',
          )
          .toUpperCase();

      let identityMatch = null;

      if (
        upstreamLegalName &&
        currentLegalName
      ) {
        identityMatch =
          normalizeName(
            upstreamLegalName,
          ) ===
          normalizeName(
            currentLegalName,
          );
      }

      const sourceOk =
        companyOk || partnersOk;

      const status =
        !sourceOk
          ? 'failed'
          : identityMatch === false
            ? 'partial_success'
            : companyOk &&
                partnersOk
              ? 'success'
              : 'partial_success';

      return {
        ok: sourceOk,
        status,

        cnpj: d.normalized,

        identityValidation: {
          match: identityMatch,

          current: {
            legalName:
              currentLegalName,
            tradeName:
              currentProfile
                ?.identity
                ?.tradeName ??
              null,
            source:
              currentProfile?.meta
                ?.source ??
              null,
          },

          queridoDiario: {
            legalName:
              upstreamLegalName,
            tradeName:
              company?.data
                ?.cnpj_info
                ?.nome_fantasia ??
              null,
          },

          warning:
            identityMatch === false
              ? 'Querido Diario company identity differs from the current company profile. Treat Querido Diario company/partner data as potentially historical or stale.'
              : null,
        },

        company,
        partners,

        meta: {
          source:
            'Querido Diario',
          sourceType:
            'open_public_api',
          estimated: false,
          identityCrossChecked:
            true,
          currentIdentitySource:
            currentProfile?.meta
              ?.source ??
            null,
        },
      };
    },
  );

  tool(
    server,
    'company.global',
    'Search global LEI company records and legal-entity metadata via GLEIF.',
    {
      name: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
    },
    async ({
      name,
      limit,
    }) => ({
      ...(await new GleifProvider({
        fetchFn,
      }).searchByName(name, {
        limit,
      })),
      meta: official(
        'GLEIF Golden Copy',
      ),
    }),
  );

  tool(
    server,
    'company.osint',
    'Build a consolidated company OSINT dossier from public/official sources.',
    {
      cnpj: z.string().min(1),
      legalName: z
        .string()
        .min(2)
        .optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      maxPages: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(2),
    },
    async (a) =>
      new CompanyOsintService({
        fetchFn,
      }).investigate(a),
  );

  tool(
    server,
    'web.profile',
    'Build a public domain profile using HTTP, DNS over HTTPS and RDAP.',
    {
      domain: z.string().min(1),
    },
    async ({ domain }) => ({
      ...(await new WebProfileService({
        fetchFn,
      }).inspect(domain)),
      meta: {
        source:
          'HTTP + DNS + RDAP',
        sourceType:
          'public_observation',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'web.history',
    'Search historical website captures via the Internet Archive Wayback CDX index.',
    {
      domain: z.string().min(1),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(50),
    },
    async ({
      domain,
      from,
      to,
      limit,
    }) => ({
      ...(await new WaybackProvider({
        fetchFn,
      }).history(domain, {
        from,
        to,
        limit,
      })),
      meta: {
        source:
          'Internet Archive Wayback',
        sourceType:
          'public_archive',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'web.technology',
    'Fingerprint common website technologies from public HTML and HTTP headers.',
    {
      domain: z.string().min(1),
    },
    async ({ domain }) => ({
      ...(await new TechnologyProvider({
        fetchFn,
      }).detect(domain)),
      meta: {
        sourceType:
          'observed_and_derived',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'web.search',
    'Search the web through the configured self-hosted SearXNG instance.',
    {
      query: z.string().min(2),
      language: z
        .string()
        .default('pt-BR'),
      categories: z
        .string()
        .default('general'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
    },
    async (a) => ({
      ...(await searx().search(a)),
      meta: {
        source:
          'self-hosted SearXNG',
        sourceType:
          'self_hosted_metasearch',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'seo.audit',
    'Run a direct technical/on-page SEO audit of a public page.',
    {
      url: z.string().min(1),
    },
    async ({ url }) => ({
      ...(await new SeoAuditProvider({
        fetchFn,
      }).audit(url)),
      meta: {
        sourceType:
          'direct_observation',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'seo.serp',
    'Search SERP-like results through self-hosted SearXNG.',
    {
      query: z.string().min(2),
      language: z
        .string()
        .default('pt-BR'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),
    },
    async ({
      query,
      language,
      limit,
    }) => ({
      ...(await searx().search({
        query,
        language,
        categories: 'general',
        limit,
      })),
      meta: {
        source:
          'self-hosted SearXNG',
        sourceType:
          'metasearch',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'seo.backlinks',
    'Query the locally accumulated backlink/link graph stored in D1.',
    {
      domain: z.string().min(1),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(100),
    },
    async ({
      domain,
      limit,
    }) => ({
      ...(await new LinkGraphLocalProvider({
        db: env.DB ?? null,
      }).backlinks(domain, {
        limit,
      })),
      meta: {
        source:
          'local link graph',
        sourceType:
          'accumulated_dataset',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'research.papers',
    'Search scientific literature using OpenAlex and Crossref and return both source result sets.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
    },
    async ({
      query,
      limit,
    }) => {
      const [
        openalex,
        crossref,
      ] = await Promise.all([
        new OpenAlexProvider({
          fetchFn,
          apiKey:
            env.OPENALEX_API_KEY ??
            null,
        }).searchWorks({
          query,
          limit,
          mailto:
            env.RESEARCH_CONTACT_EMAIL ??
            null,
        }),

        new CrossrefProvider({
          fetchFn,
        }).searchWorks({
          query,
          limit,
          mailto:
            env.RESEARCH_CONTACT_EMAIL ??
            null,
        }),
      ]);

      return {
        query,
        openalex,
        crossref,
        meta: {
          sourceType:
            'open_research_metadata',
          estimated: false,
        },
      };
    },
  );

  tool(
    server,
    'research.deep',
    'Run a multi-source research sweep across self-hosted web search, academic metadata and global news.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(25)
        .default(10),
    },
    async ({
      query,
      limit,
    }) => {
      const [
        web,
        oa,
        cr,
        news,
      ] = await Promise.all([
        searx().search({
          query,
          limit,
        }),

        new OpenAlexProvider({
          fetchFn,
          apiKey:
            env.OPENALEX_API_KEY ??
            null,
        }).searchWorks({
          query,
          limit,
          mailto:
            env.RESEARCH_CONTACT_EMAIL ??
            null,
        }),

        new CrossrefProvider({
          fetchFn,
        }).searchWorks({
          query,
          limit,
          mailto:
            env.RESEARCH_CONTACT_EMAIL ??
            null,
        }),

        new NewsSearchService({
          fetchFn,
        }).search({
          query,
          timespan: '3months',
          limit,
        }),
      ]);

      return {
        query,
        web,
        openalex: oa,
        crossref: cr,
        news,
        meta: {
          sourceType:
            'multi_source_research',
          estimated: false,
        },
      };
    },
  );

  tool(
    server,
    'news.search',
    'Search news using GDELT with automatic Bing News RSS fallback.',
    {
      query: z.string().min(2),
      timespan: z
        .string()
        .default('1week'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .default(25),
    },
    async (a) => {
      const result =
        await new NewsSearchService({
          fetchFn,
        }).search(a);

      return {
        ...result,
        meta: {
          source:
            result.selectedProvider ===
            'gdelt_doc'
              ? 'GDELT DOC'
              : result.selectedProvider ===
                  'bing_news_rss'
                ? 'Bing News RSS'
                : 'GDELT DOC + Bing News RSS',
          sourceType:
            'public_news_index',
          estimated: false,
          fallbackUsed:
            result.fallbackUsed ??
            false,
        },
      };
    },
  );

  tool(
    server,
    'market.ibge',
    'Query an IBGE SIDRA table using structured table/territory/period parameters.',
    {
      table: z.union([
        z.string(),
        z.number(),
      ]),
      level: z
        .union([
          z.string(),
          z.number(),
        ])
        .default(6),
      territories: z
        .string()
        .default('all'),
      periods: z
        .string()
        .default('last'),
      variables: z
        .string()
        .default('all'),
    },
    async (a) => ({
      ...(await new IbgeSidraProvider({
        fetchFn,
      }).table(a)),
      meta: official(
        'IBGE SIDRA',
      ),
    }),
  );

  tool(
    server,
    'market.weather',
    'Get current conditions and forecast from Open-Meteo.',
    {
      latitude: z
        .number()
        .min(-90)
        .max(90),
      longitude: z
        .number()
        .min(-180)
        .max(180),
      timezone: z
        .string()
        .default('auto'),
      days: z
        .number()
        .int()
        .min(1)
        .max(16)
        .default(7),
    },
    async (a) => ({
      ...(await new OpenMeteoProvider({
        fetchFn,
      }).forecast(a)),
      meta: {
        source: 'Open-Meteo',
        sourceType:
          'open_weather_data',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'youtube.metadata',
    'Get public YouTube video metadata through the keyless oEmbed endpoint.',
    {
      url: z.string().url(),
    },
    async ({ url }) =>
      youtube().metadata(url),
  );

  tool(
    server,
    'youtube.transcript',
    'Get a YouTube transcript using a configured self-hosted transcript service, with optional Kome fallback.',
    {
      url: z.string().url(),
    },
    async ({ url }) =>
      youtube().transcript(url),
  );

  tool(
    server,
    'reddit.search',
    'Search public Reddit posts through the public JSON surface.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
      sort: z
        .enum([
          'relevance',
          'hot',
          'top',
          'new',
          'comments',
        ])
        .default('relevance'),
      time: z
        .enum([
          'hour',
          'day',
          'week',
          'month',
          'year',
          'all',
        ])
        .default('month'),
    },
    async (a) =>
      new RedditProvider({
        fetchFn,
      }).search(a),
  );

  tool(
    server,
    'social.search_mentions',
    'Search indexed public social mentions using self-hosted SearXNG across Reddit, YouTube, X and Instagram surfaces.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),
    },
    async ({
      query,
      limit,
    }) =>
      searx().search({
        query: `${query} (site:reddit.com OR site:youtube.com OR site:x.com OR site:instagram.com)`,
        limit,
      }),
  );

  tool(
    server,
    'ads.search_public',
    'Search indexed public ad-transparency surfaces using self-hosted SearXNG; this is not a substitute for licensed ad-firehose data.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),
    },
    async ({
      query,
      limit,
    }) =>
      searx().search({
        query: `${query} (site:facebook.com/ads/library OR site:adstransparency.google.com)`,
        limit,
      }),
  );

  tool(
    server,
    'finance.bcb_series',
    'Query an official Banco Central do Brasil SGS time series.',
    {
      code: z.union([
        z.string(),
        z.number(),
      ]),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    },
    async (a) => ({
      ...(await new BcbProvider({
        fetchFn,
      }).series(a)),
      meta: official(
        'Banco Central do Brasil',
      ),
    }),
  );

  tool(
    server,
    'finance.sec_companyfacts',
    'Get SEC EDGAR XBRL company facts for a CIK.',
    {
      cik: z.union([
        z.string(),
        z.number(),
      ]),
    },
    async ({ cik }) => ({
      ...(await new SecProvider({
        fetchFn,
        userAgent:
          env.SEC_USER_AGENT ??
          'DeltaBotsArcturianLattice/1.0 admin@example.invalid',
      }).companyFacts(cik)),
      meta: official(
        'SEC EDGAR',
      ),
    }),
  );

  tool(
    server,
    'finance.sec_submissions',
    'Get SEC EDGAR filing/submission history for a CIK.',
    {
      cik: z.union([
        z.string(),
        z.number(),
      ]),
    },
    async ({ cik }) => ({
      ...(await new SecProvider({
        fetchFn,
        userAgent:
          env.SEC_USER_AGENT ??
          'DeltaBotsArcturianLattice/1.0 admin@example.invalid',
      }).submissions(cik)),
      meta: official(
        'SEC EDGAR',
      ),
    }),
  );

  tool(
    server,
    'market.crypto_rates',
    'Get public cryptocurrency/fiat exchange rates from Coinbase public data.',
    {
      currency: z
        .string()
        .min(2)
        .default('BTC'),
    },
    async ({
      currency,
    }) => ({
      ...(await new CryptoProvider({
        fetchFn,
      }).exchangeRates(currency)),
      meta: {
        source:
          'Coinbase public endpoint',
        sourceType:
          'public_market_data',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'competitive.snapshot',
    'Create a multi-source competitive snapshot for one domain.',
    {
      domain: z.string().min(1),
    },
    async ({ domain }) =>
      new CompetitiveService({
        fetchFn,
      }).snapshot(domain),
  );

  tool(
    server,
    'competitive.compare',
    'Compare up to five domains using the same derived Digital Visibility methodology.',
    {
      domains: z
        .array(
          z.string().min(1),
        )
        .min(2)
        .max(5),
    },
    async ({ domains }) =>
      new CompetitiveService({
        fetchFn,
      }).compare(domains),
  );

  tool(
    server,
    'competitive.traffic_estimate',
    'Estimate traffic only when a locally calibrated model exists; otherwise returns an explicit unavailable status.',
    {
      domain: z.string().min(1),
      segment: z
        .string()
        .default('default'),
    },
    async ({
      domain,
      segment,
    }) =>
      new TrafficEstimatorService({
        db: env.DB ?? null,
        fetchFn,
      }).estimate(domain, {
        segment,
      }),
  );

  tool(
    server,
    'monitor.create',
    'Create a continuous-intelligence monitor in D1.',
    {
      name: z.string().min(1),
      type: z.enum([
        'web_profile',
        'competitive_snapshot',
      ]),
      target: z.string().min(1),
      intervalMinutes: z
        .number()
        .int()
        .min(30)
        .max(43200)
        .default(1440),
    },
    async (a) =>
      new MonitorService({
        db: env.DB ?? null,
        fetchFn,
      }).create(a),
  );

  tool(
    server,
    'monitor.list',
    'List continuous-intelligence monitors.',
    {},
    async () =>
      new MonitorService({
        db: env.DB ?? null,
        fetchFn,
      }).list(),
  );

  tool(
    server,
    'monitor.run',
    'Run one monitor now, persist a snapshot and emit a change event when its hash differs.',
    {
      id: z.string().min(1),
    },
    async ({ id }) =>
      new MonitorService({
        db: env.DB ?? null,
        fetchFn,
      }).run(id),
  );

  tool(
    server,
    'monitor.events',
    'List detected intelligence change events.',
    {
      monitorId: z
        .string()
        .optional(),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(50),
    },
    async (a) =>
      new MonitorService({
        db: env.DB ?? null,
        fetchFn,
      }).events(a),
  );

  tool(
    server,
    'monitor.run_due',
    'Run due monitors; intended for manual testing and Cloudflare Cron.',
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5),
    },
    async ({ limit }) =>
      new MonitorService({
        db: env.DB ?? null,
        fetchFn,
      }).runDue({
        limit,
      }),
  );

  tool(
    server,
    'web.sitemap',
    'Discover URLs published in sitemap.xml or sitemap_index.xml without crawling the whole site.',
    {
      domain: z.string().min(1),
      limit: z
        .number()
        .int()
        .min(1)
        .max(5000)
        .default(500),
    },
    async ({
      domain,
      limit,
    }) => ({
      ...(await new SitemapProvider({
        fetchFn,
      }).urls(domain, {
        limit,
      })),
      meta: {
        sourceType:
          'direct_observation',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'osint.subdomains',
    'Discover public subdomain signals from certificate-transparency records.',
    {
      domain: z.string().min(1),
      limit: z
        .number()
        .int()
        .min(1)
        .max(2000)
        .default(500),
    },
    async ({
      domain,
      limit,
    }) => ({
      ...(await new CertificateTransparencyProvider({
        fetchFn,
      }).subdomains(domain, {
        limit,
      })),
      meta: {
        source:
          'crt.sh certificate transparency',
        sourceType:
          'public_certificate_data',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'infra.network',
    'Resolve public routing information for an IP address through RIPEstat.',
    {
      resource: z.string().min(2),
    },
    async ({
      resource,
    }) => ({
      ...(await new RipeStatProvider({
        fetchFn,
      }).networkInfo(resource)),
      meta: {
        source: 'RIPEstat',
        sourceType:
          'public_network_data',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'infra.peering',
    'Look up public network/peering metadata by ASN through PeeringDB.',
    {
      asn: z.union([
        z.string(),
        z.number(),
      ]),
    },
    async ({ asn }) => ({
      ...(await new PeeringDbProvider({
        fetchFn,
      }).networkByAsn(asn)),
      meta: {
        source: 'PeeringDB',
        sourceType:
          'public_network_registry',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'geo.search',
    'Geocode/search places through a configured self-hosted Nominatim instance.',
    {
      query: z.string().min(2),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
      countrycodes: z
        .string()
        .optional(),
    },
    async (a) =>
      new NominatimProvider({
        fetchFn,
        baseUrl:
          env.NOMINATIM_URL ??
          null,
      }).search(a),
  );

  tool(
    server,
    'regulatory.sync_anatel',
    'Synchronize the next page of the official ANATEL STEL SCM dataset into the local D1 mirror.',
    {},
    async () =>
      new AnatelSyncService({
        db: env.DB ?? null,
        fetchFn,
      }).syncNextPage(),
  );

  tool(
    server,
    'regulatory.search',
    'Search locally mirrored Brazilian regulatory/open datasets (CVM, ANS, ANVISA, ANATEL, ANEEL, ANP, SUSEP).',
    {
      source: z.enum([
        'cvm',
        'ans',
        'anvisa',
        'anatel',
        'aneel',
        'anp',
        'susep',
      ]),
      query: z.string().optional(),
      cnpj: z.string().optional(),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(50),
    },
    async (a) => ({
      ...(await new OpenDataLocalProvider({
        db: env.DB ?? null,
      }).search(a)),
      meta: {
        sourceType:
          'official_dataset_mirror',
        estimated: false,
      },
    }),
  );

  tool(
    server,
    'market.open_data',
    'Search locally mirrored market datasets such as COMEXSTAT and aggregated RAIS/CAGED.',
    {
      source: z.enum([
        'comexstat',
        'rais_caged',
      ]),
      query: z.string().optional(),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(50),
    },
    async (a) => ({
      ...(await new OpenDataLocalProvider({
        db: env.DB ?? null,
      }).search(a)),
      meta: {
        sourceType:
          'official_dataset_mirror',
        estimated: false,
      },
    }),
  );

  return server;
}

function tool(
  server,
  name,
  description,
  inputSchema,
  handler,
) {
  server.registerTool(
    name,
    {
      description,
      inputSchema,
    },
    async (args) => {
      try {
        const value =
          await handler(
            args ?? {},
          );

        const isError =
          value?.error != null ||
          value?.ok === false ||
          value?.status ===
            'failed';

        return jsonToolResult(
          value,
          isError,
        );
      } catch (error) {
        return errorToolResult(
          error,
        );
      }
    },
  );
}

function jsonToolResult(
  value,
  isError = false,
) {
  return {
    isError,
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          value,
          null,
          2,
        ),
      },
    ],
  };
}

function errorToolResult(
  error,
) {
  return jsonToolResult(
    {
      error: {
        code:
          error?.code ??
          'UNEXPECTED_ERROR',
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
    },
    true,
  );
}

function fail(
  code,
  message,
  details,
) {
  return {
    error: {
      code,
      message,
      ...(details !== undefined
        ? {
            details,
          }
        : {}),
    },
  };
}

function official(source) {
  return {
    source,
    sourceType:
      'official_public_api',
    authoritative: true,
    estimated: false,
  };
}

function boolEnv(value) {
  return [
    '1',
    'true',
    'yes',
    'on',
  ].includes(
    String(
      value ?? '',
    ).toLowerCase(),
  );
}
