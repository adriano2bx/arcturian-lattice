const BASE_URL =
  'https://sistemas.anatel.gov.br/stel/consultas/ListaPrestadorasServico/tela.asp';

export class AnatelStelProvider {
  constructor({
    fetchFn = globalThis.fetch,
  } = {}) {
    this.id = 'anatel_stel';
    this.fetchFn = fetchFn;
  }

  async fetchPage({
    service = '045',
    page = 1,
  } = {}) {
    const effectivePage = Math.max(
      1,
      Number(page) || 1,
    );

    const url = new URL(BASE_URL);
    url.searchParams.set(
      'pNumServico',
      service,
    );

    if (effectivePage > 1) {
      url.searchParams.set(
        'nav',
        String(effectivePage),
      );
      url.searchParams.set('c', '1');
      url.searchParams.set('pref', '');
    }

    let response;

    try {
      response = await this.fetchFn(
        url.toString(),
        {
          headers: {
            accept:
              'text/html,application/xhtml+xml',
            'user-agent':
              'DeltaBotsArcturianLattice/1.1',
          },
        },
      );
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: 'network_error',
        detail: String(
          error?.message ?? error,
        ),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        provider: this.id,
        reason: 'upstream_error',
        status: response.status,
      };
    }

    const bytes =
      await response.arrayBuffer();

    const html = new TextDecoder(
      'windows-1252',
    ).decode(bytes);

    const records =
      parsePrestadoras(html);

    const pagination =
      parsePagination(html);

    return {
      ok: true,
      provider: this.id,
      source: 'ANATEL STEL',
      service,
      page: effectivePage,
      records,
      count: records.length,
      pagination,
      sourceUrl: url.toString(),
    };
  }
}

export function parsePrestadoras(
  html,
) {
  const records = [];

  const rowRegex =
    /<tr[^>]*id=["']TRplus045["'][^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;

  while (
    (rowMatch =
      rowRegex.exec(html)) !== null
  ) {
    const rowHtml = rowMatch[1];

    const cells = [
      ...rowHtml.matchAll(
        /<td\b[^>]*>([\s\S]*?)<\/td>/gi,
      ),
    ].map((match) =>
      cleanCell(match[1]),
    );

    if (cells.length < 7) {
      continue;
    }

    const [
      name,
      process,
      act,
      grantDate,
      term,
      address,
      phone,
    ] = cells;

    const processId =
      normalizeProcess(process);

    if (!name || !processId) {
      continue;
    }

    records.push({
      entityId: processId,

      name,

      process: processId,

      processRaw: process,

      act:
        act || null,

      grantDate:
        grantDate || null,

      term:
        term || null,

      address:
        address || null,

      phone:
        normalizePhone(phone),

      service: {
        code: '045',
        name:
          'Serviço de Comunicação Multimídia',
        acronym: 'SCM',
      },
    });
  }

  return records;
}

export function parsePagination(
  html,
) {
  const pageMatch =
    html.match(
      /Valores válidos:\s*1\s*a\s*(\d+)/i,
    );

  const totalMatch =
    html.match(
      /menor do que\s*(\d+)/i,
    );

  const totalPages =
    pageMatch
      ? Number(pageMatch[1])
      : null;

  /*
   * STEL says the allowed number of
   * records per page must be lower
   * than total + 1.
   *
   * Example:
   * "menor do que 18455" may reflect
   * the server's UI constraint rather
   * than an authoritative total.
   *
   * Therefore we expose this only as
   * an observed hint, not as a
   * conclusive record count.
   */
  const observedLimitHint =
    totalMatch
      ? Number(totalMatch[1])
      : null;

  return {
    totalPages,
    observedLimitHint,
  };
}

function cleanCell(value) {
  return decodeHtmlEntities(
    String(value ?? '')
      .replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        ' ',
      )
      .replace(
        /<style\b[^>]*>[\s\S]*?<\/style>/gi,
        ' ',
      )
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function normalizeProcess(value) {
  return String(value ?? '')
    .replace(
      /\s*\((?:SICAP|SEI)\)\s*/gi,
      '',
    )
    .trim();
}

function normalizePhone(value) {
  const text =
    String(value ?? '')
      .replace(
        /^Tel:\s*/i,
        '',
      )
      .trim();

  return text || null;
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(
      /&#(\d+);/g,
      (_, n) =>
        String.fromCodePoint(
          Number(n),
        ),
    )
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, n) =>
        String.fromCodePoint(
          parseInt(n, 16),
        ),
    );
}
