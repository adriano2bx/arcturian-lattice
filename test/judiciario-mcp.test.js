import test from "node:test";
import assert from "node:assert/strict";
import {
  JudiciarioMcpProvider,
  extractMcpToolPayload,
  normalizeJudiciarioPublications,
} from "../src/providers/judiciario-mcp.js";

test("Judiciario MCP provider sends buscar_por_parte with bearer auth", async () => {
  let seen;
  const fetchFn = async (url, init) => {
    seen = { url, init, body: JSON.parse(init.body) };
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "x",
        result: {
          structuredContent: {
            fonte: "DJEN",
            resultado: {
              items: [
                {
                  numeroProcessoFormatado: "0000000-00.2026.8.26.0000",
                  textoLimpo: "Teste",
                },
              ],
            },
          },
          isError: false,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const provider = new JudiciarioMcpProvider({
    fetchFn,
    endpoint: "https://dev.mcp.judiciario.2bx.com.br",
    bearerToken: "secret",
  });
  const result = await provider.searchByParty({
    name: "EMPRESA TESTE LTDA",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-11",
    pageSize: 10,
  });

  assert.equal(result.ok, true);
  assert.equal(seen.url, "https://dev.mcp.judiciario.2bx.com.br/mcp");
  assert.equal(seen.init.headers.authorization, "Bearer secret");
  assert.equal(seen.body.method, "tools/call");
  assert.equal(seen.body.params.name, "buscar_por_parte");
  assert.equal(seen.body.params.arguments.nomeParte, "EMPRESA TESTE LTDA");
  assert.equal(result.publications[0].text, "Teste");
});

test("Judiciario MCP provider reports tool-level error", async () => {
  const fetchFn = async () =>
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "x",
        result: {
          content: [{ type: "text", text: "DJEN/CNJ respondeu HTTP 504" }],
          isError: true,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  const provider = new JudiciarioMcpProvider({
    fetchFn,
    endpoint: "https://example.test/mcp",
  });
  const result = await provider.searchByParty({ name: "BANCO DO BRASIL" });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "tool_error");
});

test("DJEN public fallback searches by OAB without an upstream MCP", async () => {
  let seenUrl;
  const fetchFn = async (url) => {
    seenUrl = url;
    return new Response(
      JSON.stringify({
        count: 1,
        items: [{ numeroProcesso: "123", texto: "Publicação" }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const result = await new JudiciarioMcpProvider({ fetchFn }).searchByOab({
    oab: "123456",
    uf: "SP",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-01",
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider, "djen_public");
  assert.match(seenUrl, /comunicaapi\.pje\.jus\.br\/api\/v1\/comunicacao/);
  assert.match(seenUrl, /numeroOab=123456/);
  assert.match(seenUrl, /ufOab=SP/);
  assert.equal(result.publications[0].processNumber, "123");
});

test("DJEN public fallback searches company publications by party name", async () => {
  let seenUrl;
  const fetchFn = async (url) => {
    seenUrl = url;
    return new Response(
      JSON.stringify({
        count: 1,
        items: [{ numeroProcesso: "123", texto: "Parte pública" }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const result = await new JudiciarioMcpProvider({ fetchFn }).searchByParty({
    name: "BANCO DO BRASIL",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-01",
    pageSize: 10,
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider, "djen_public");
  assert.match(seenUrl, /nomeParte=BANCO\+DO\+BRASIL/);
  assert.equal(result.publications[0].processNumber, "123");
});

test("extracts JSON content when structuredContent is absent", () => {
  assert.deepEqual(
    extractMcpToolPayload({ content: [{ type: "text", text: '{"ok":true}' }] }),
    { ok: true },
  );
});

test("normalizes DJEN publication field variants", () => {
  const out = normalizeJudiciarioPublications({
    items: [{ numero_processo: "123", texto: "abc", sigla_tribunal: "TJSP" }],
  });
  assert.equal(out[0].processNumber, "123");
  assert.equal(out[0].court, "TJSP");
  assert.equal(out[0].text, "abc");
});
