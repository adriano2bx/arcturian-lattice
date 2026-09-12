import { MinhaReceitaCnpjProvider } from '../providers/minhareceita.js';
import { CompanyProfileService } from './company-profile.js';
import { BrasilApiCnpjProvider } from '../providers/brasilapi.js';
import { TcuCertificatesProvider } from '../providers/tcu-certificates.js';
import { PncpContractsProvider } from '../providers/pncp-contracts.js';
import { QueridoDiarioProvider } from '../providers/querido-diario.js';
import { GleifProvider } from '../providers/gleif.js';
import { NewsSearchService } from './news-search.js';
import { describeCnpj } from '../core/cnpj.js';

export class CompanyOsintService {
  constructor({
    fetchFn = globalThis.fetch,
  } = {}) {
    this.fetchFn = fetchFn;
  }

  async investigate({
    cnpj,
    legalName = null,
    dateFrom,
    dateTo,
    maxPages = 2,
  }) {
    const doc =
      describeCnpj(cnpj);

    if (!doc.valid) {
      return {
        status: 'failed',
        error: {
          code: 'INVALID_CNPJ',
        },
        document: doc,
      };
    }

    const profileSvc =
      new CompanyProfileService({
        providers: [
          new BrasilApiCnpjProvider({
            fetchFn: this.fetchFn,
          }),
          new MinhaReceitaCnpjProvider({
            fetchFn: this.fetchFn,
          }),
        ],
      });

    let profile = null;

    try {
      profile =
        await profileSvc.getByCnpj(
          doc.normalized,
        );
    } catch {}

    const name =
      legalName ??
      profile?.identity?.legalName ??
      null;

    const qd =
      new QueridoDiarioProvider({
        fetchFn: this.fetchFn,
      });

    const newsService =
      new NewsSearchService({
        fetchFn: this.fetchFn,
      });

    const gleif =
      new GleifProvider({
        fetchFn: this.fetchFn,
      });

    const jobs = [
      [
        'risk',
        new TcuCertificatesProvider({
          fetchFn: this.fetchFn,
        }).check(doc.normalized),
      ],

      [
        'gazetteCompany',
        qd.company(doc.normalized),
      ],

      [
        'gazettePartners',
        qd.partners(doc.normalized),
      ],

      ...(name
        ? [
            [
              'globalEntity',
              gleif.searchByName(
                name,
                {
                  limit: 5,
                },
              ),
            ],
            [
              'news',
              newsService.search({
                query: `"${name}"`,
                timespan: '3months',
                limit: 25,
              }),
            ],
          ]
        : []),

      ...(dateFrom && dateTo
        ? [
            [
              'publicContracts',
              new PncpContractsProvider({
                fetchFn: this.fetchFn,
              }).searchContracts({
                cnpj:
                  doc.normalized,
                role: 'supplier',
                dateFrom,
                dateTo,
                maxPages,
              }),
            ],
          ]
        : []),
    ];

    const settled =
      await Promise.all(
        jobs.map(
          async ([key, promise]) => {
            try {
              const value =
                await promise;

              return [
                key,
                value,
              ];
            } catch (error) {
              return [
                key,
                {
                  ok: false,
                  reason:
                    'exception',
                  detail:
                    String(
                      error?.message ??
                        error,
                    ),
                },
              ];
            }
          },
        ),
      );

    const data =
      Object.fromEntries(
        settled,
      );

    const currentLegalName =
      profile?.identity
        ?.legalName ??
      null;

    const qdLegalName =
      data.gazetteCompany
        ?.data?.cnpj_info
        ?.razao_social ??
      null;

    let gazetteIdentityMatch =
      null;

    if (
      currentLegalName &&
      qdLegalName
    ) {
      gazetteIdentityMatch =
        normalizeCompanyName(
          currentLegalName,
        ) ===
        normalizeCompanyName(
          qdLegalName,
        );
    }

    if (
      gazetteIdentityMatch ===
      false
    ) {
      if (
        data.gazetteCompany
      ) {
        data.gazetteCompany =
          {
            ...data.gazetteCompany,

            identityValidation:
              {
                match: false,

                currentLegalName,

                sourceLegalName:
                  qdLegalName,

                warning:
                  'Querido Diario company identity differs from the current company profile. Treat this signal as potentially historical or stale.',
              },

            staleIdentity:
              true,
          };
      }

      if (
        data.gazettePartners
      ) {
        data.gazettePartners =
          {
            ...data.gazettePartners,

            identityValidation:
              {
                match: false,

                currentLegalName,

                sourceLegalName:
                  qdLegalName,

                warning:
                  'Querido Diario partner data may belong to a historical company identity and must not be treated as the current ownership structure without corroboration.',
              },

            staleIdentity:
              true,
          };
      }
    }

    const okCount =
      Object.values(data)
        .filter(
          (value) =>
            value?.ok === true,
        )
        .length;

    let status;

    if (okCount === 0) {
      status = 'failed';
    } else if (
      okCount ===
        settled.length &&
      gazetteIdentityMatch !==
        false
    ) {
      status = 'success';
    } else {
      status =
        'partial_success';
    }

    return {
      status,

      company: {
        cnpj:
          doc.normalized,

        legalName: name,

        profile,
      },

      identityValidation: {
        currentLegalName,

        queriedLegalName:
          name,

        gazette: {
          match:
            gazetteIdentityMatch,

          sourceLegalName:
            qdLegalName,

          stale:
            gazetteIdentityMatch ===
            false,
        },
      },

      signals:
        data,

      confidence: {
        class:
          gazetteIdentityMatch ===
          false
            ? 'mixed_with_identity_conflict'
            : 'mixed',

        note:
          gazetteIdentityMatch ===
          false
            ? 'Current company profile conflicts with Querido Diario identity. Querido Diario signals are preserved as potentially historical data and should not be treated as current without corroboration.'
            : 'Combines authoritative, observed and public-index sources; inspect each signal provider.',
      },
    };
  }
}

function normalizeCompanyName(
  value,
) {
  return String(value ?? '')
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
}
