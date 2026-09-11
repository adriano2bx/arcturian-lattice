import test from "node:test";
import assert from "node:assert/strict";
import { PncpContractsProvider, normalizePncpDate } from "../src/providers/pncp-contracts.js";

test("normalizes PNCP dates", () => {
  assert.equal(normalizePncpDate("2026-09-01"), "20260901");
  assert.equal(normalizePncpDate("20260930"), "20260930");
  assert.throws(() => normalizePncpDate("2026-02-31"), /not valid/);
});

test("organization mode sends cnpjOrgao to the official query endpoint", async () => {
  const urls = [];
  const provider = new PncpContractsProvider({
    fetchFn: async (url) => {
      urls.push(new URL(url));
      return new Response(JSON.stringify({ data: [], totalPaginas: 1 }), { status: 200 });
    },
  });

  const result = await provider.searchContracts({
    cnpj: "00.000.000/0001-91",
    role: "organization",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
  });

  assert.equal(result.ok, true);
  assert.equal(urls[0].pathname, "/api/consulta/v1/contratos");
  assert.equal(urls[0].searchParams.get("cnpjOrgao"), "00000000000191");
  assert.equal(urls[0].searchParams.get("dataInicial"), "20260901");
});

test("supplier mode filters niFornecedor client-side and reports complete coverage", async () => {
  const provider = new PncpContractsProvider({
    fetchFn: async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              numeroControlePNCP: "a",
              niFornecedor: "00.000.000/0001-91",
              nomeRazaoSocialFornecedor: "BANCO DO BRASIL SA",
              objetoContrato: "Servico A",
              valorGlobal: 123.45,
            },
            {
              numeroControlePNCP: "b",
              niFornecedor: "11.111.111/0001-81",
              nomeRazaoSocialFornecedor: "OUTRA EMPRESA",
            },
          ],
          totalPaginas: 1,
        }),
        { status: 200 },
      ),
  });

  const result = await provider.searchContracts({
    cnpj: "00.000.000/0001-91",
    role: "supplier",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
    pageSize: 50,
  });

  assert.equal(result.contracts.length, 1);
  assert.equal(result.contracts[0].supplier.identifier, "00000000000191");
  assert.equal(result.contracts[0].values.global, 123.45);
  assert.equal(result.coverage.complete, true);
});

test("supplier mode flags incomplete coverage when maxPages cap is reached", async () => {
  const provider = new PncpContractsProvider({
    fetchFn: async () => {
      const records = Array.from({ length: 10 }, (_, index) => ({
        numeroControlePNCP: String(index),
        niFornecedor: "11111111000191",
      }));
      return new Response(JSON.stringify({ data: records, totalPaginas: 99 }), { status: 200 });
    },
  });

  const result = await provider.searchContracts({
    cnpj: "00.000.000/0001-91",
    role: "supplier",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
    pageSize: 10,
    maxPages: 2,
  });

  assert.equal(result.coverage.complete, false);
  assert.equal(result.coverage.pagesScanned, 2);
});
