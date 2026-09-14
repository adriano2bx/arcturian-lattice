function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseSsePayload(text) {
  const dataLines = String(text)
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  if (!dataLines.length) return null;
  for (const line of dataLines.reverse()) {
    try {
      return JSON.parse(line);
    } catch {
      // Continue until a JSON data event is found.
    }
  }
  return null;
}

export class JudiciarioMcpProvider {
  constructor({
    fetchFn = globalThis.fetch,
    endpoint = null,
    bearerToken = null,
    publicDjenUrl = 'https://comunicaapi.pje.jus.br/api/v1/comunicacao',
    protocolVersion = "2025-11-25",
  } = {}) {
    this.id = "judiciario_br_mcp";
    this.fetchFn = fetchFn;
    this.endpoint = endpoint ? endpoint.replace(/\/$/, "") : null;
    this.bearerToken = bearerToken;
    this.publicDjenUrl = publicDjenUrl.replace(/\/$/, '');
    this.protocolVersion = protocolVersion;
  }

  configured() {
    return Boolean(this.endpoint);
  }

  async searchByParty({ name, dateFrom, dateTo, tribunal, page = 1, pageSize = 20 }) {
    if (!this.configured()) {
      return { ok: false, provider: this.id, reason: "not_configured" };
    }
    if (!String(name ?? "").trim()) {
      throw new Error("name is required.");
    }

    const args = {
      nomeParte: String(name).trim(),
      ...(tribunal ? { siglaTribunal: String(tribunal).trim().toUpperCase() } : {}),
      ...(dateFrom ? { dataInicio: normalizeIsoDate(dateFrom, "dateFrom") } : {}),
      ...(dateTo ? { dataFim: normalizeIsoDate(dateTo, "dateTo") } : {}),
      pagina: normalizePositiveInt(page, "page", 1, 100000),
      itensPorPagina: normalizePositiveInt(pageSize, "pageSize", 1, 20),
    };

    const rpc = await this.callTool("buscar_por_parte", args);
    if (!rpc.ok) return rpc;

    const envelope = extractMcpToolPayload(rpc.payload);
    return {
      ok: true,
      provider: this.id,
      query: args,
      publications: normalizeJudiciarioPublications(envelope),
      raw: envelope,
    };
  }

  async searchByOab({ oab, uf, dateFrom, dateTo, tribunal, page = 1, pageSize = 20 }) {
    const numeroOab = String(oab ?? "").trim().replace(/[^0-9A-Za-z-]/g, "");
    if (!numeroOab) throw new Error("oab is required.");
    if (!this.configured()) return this.searchPublicDjen({ numeroOab, uf, dateFrom, dateTo, tribunal, page, pageSize });
    const args = {
      numeroOab,
      ...(uf ? { ufOab: String(uf).trim().toUpperCase() } : {}),
      ...(tribunal ? { siglaTribunal: String(tribunal).trim().toUpperCase() } : {}),
      ...(dateFrom ? { dataInicio: normalizeIsoDate(dateFrom, "dateFrom") } : {}),
      ...(dateTo ? { dataFim: normalizeIsoDate(dateTo, "dateTo") } : {}),
      pagina: normalizePositiveInt(page, "page", 1, 100000),
      itensPorPagina: normalizePositiveInt(pageSize, "pageSize", 1, 20),
    };
    const rpc = await this.callTool("buscar_por_oab", args);
    if (!rpc.ok) return rpc;
    const envelope = extractMcpToolPayload(rpc.payload);
    return { ok: true, provider: this.id, query: args, publications: normalizeJudiciarioPublications(envelope), raw: envelope };
  }

  async searchPublicDjen({ numeroOab, uf, dateFrom, dateTo, tribunal, page = 1, pageSize = 20 }) {
    const params = new URLSearchParams({ numeroOab, pagina: String(page), itensPorPagina: String(pageSize) });
    if (uf) params.set('ufOab', String(uf).trim().toUpperCase());
    if (tribunal) params.set('siglaTribunal', String(tribunal).trim().toUpperCase());
    if (dateFrom) params.set('dataDisponibilizacaoInicio', normalizeIsoDate(dateFrom, 'dateFrom'));
    if (dateTo) params.set('dataDisponibilizacaoFim', normalizeIsoDate(dateTo, 'dateTo'));
    const url = `${this.publicDjenUrl}?${params}`;
    try {
      const response = await this.fetchFn(url, { headers: { accept: 'application/json' } });
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 500) }; }
      if (!response.ok) return { ok: false, provider: 'djen_public', reason: 'upstream_error', status: response.status, detail: body };
      return { ok: true, provider: 'djen_public', query: Object.fromEntries(params), count: body?.count ?? null, publications: normalizeJudiciarioPublications(body), raw: body };
    } catch (error) {
      return { ok: false, provider: 'djen_public', reason: 'network_error', detail: error instanceof Error ? error.message : String(error) };
    }
  }

  async callTool(toolName, args) {
    const url = this.endpoint.endsWith("/mcp") ? this.endpoint : `${this.endpoint}/mcp`;
    const headers = {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": this.protocolVersion,
    };
    if (this.bearerToken) headers.authorization = `Bearer ${this.bearerToken}`;

    let response;
    try {
      response = await this.fetchFn(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `nexus-${Date.now()}`,
          method: "tools/call",
          params: { name: toolName, arguments: args },
        }),
      });
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        reason: "network_error",
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const contentType = response.headers?.get?.("content-type") ?? "";
    const text = await response.text();
    let payload;
    if (contentType.includes("text/event-stream")) payload = parseSsePayload(text);
    else payload = parseMaybeJson(text);

    if (!response.ok) {
      return {
        ok: false,
        provider: this.id,
        reason: response.status === 401 ? "unauthorized" : "upstream_error",
        status: response.status,
        detail: payload,
      };
    }

    if (!payload || payload.error) {
      return {
        ok: false,
        provider: this.id,
        reason: "rpc_error",
        detail: payload?.error ?? payload ?? text,
      };
    }

    const toolResult = payload.result ?? payload;
    if (toolResult?.isError) {
      return {
        ok: false,
        provider: this.id,
        reason: "tool_error",
        detail: extractMcpToolPayload(toolResult),
      };
    }

    return { ok: true, provider: this.id, payload: toolResult };
  }
}

export function extractMcpToolPayload(toolResult) {
  if (!toolResult) return null;
  if (toolResult.structuredContent !== undefined) return toolResult.structuredContent;
  if (toolResult.result?.structuredContent !== undefined) return toolResult.result.structuredContent;

  const content = toolResult.content ?? toolResult.result?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item?.type === "text" && typeof item.text === "string") {
        const parsed = parseMaybeJson(item.text);
        if (typeof parsed !== "string") return parsed;
      }
    }
  }
  return toolResult;
}

export function normalizeJudiciarioPublications(envelope) {
  const candidate = envelope?.resultado ?? envelope?.data ?? envelope;
  const items = candidate?.items ?? candidate?.itens ?? candidate?.publicacoes ?? [];
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    processNumber:
      item.numeroProcessoFormatado ??
      item.numeroProcesso ??
      item.numero_processo ??
      item.numeroprocessocommascara ??
      null,
    court: item.siglaTribunal ?? item.sigla_tribunal ?? item.tribunal ?? null,
    communicationType: item.tipoComunicacao ?? item.tipo_comunicacao ?? item.tipo ?? null,
    availableAt: item.dataDisponibilizacao ?? item.data_disponibilizacao ?? null,
    publishedAt: item.dataPublicacao ?? item.data_publicacao ?? null,
    recipient: item.nomeDestinatario ?? item.nome_destinatario ?? null,
    organ: item.nomeOrgao ?? item.nome_orgao ?? item.orgao ?? null,
    text: item.textoLimpo ?? item.texto ?? null,
    certificateHash: item.hash ?? item.hashComunicacao ?? item.hash_comunicacao ?? null,
  }));
}

function normalizeIsoDate(value, field) {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`${field} must use YYYY-MM-DD.`);
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new Error(`${field} is not a valid date.`);
  }
  return text;
}

function normalizePositiveInt(value, field, min, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return n;
}
