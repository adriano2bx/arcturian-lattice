import test from "node:test";
import assert from "node:assert/strict";
import { TcuCertificatesProvider, summarizeCertificates } from "../src/providers/tcu-certificates.js";

test("TCU consolidated certificate provider documents numeric-only capability", () => {
  const provider = new TcuCertificatesProvider({ fetchFn: async () => { throw new Error("not called"); } });
  assert.equal(provider.supports("00000000000191"), true);
  assert.equal(provider.supports("00000000E08G12"), false);
});

test("normalizes consolidated certificates and uses no-PDF mode", async () => {
  const urls = [];
  const provider = new TcuCertificatesProvider({
    fetchFn: async (url) => {
      urls.push(url);
      return new Response(
        JSON.stringify({
          razaoSocial: "EMPRESA TESTE SA",
          nomeFantasia: "TESTE",
          cnpj: "00.000.000/0001-91",
          uf: "DF",
          certidoes: [
            { emissor: "TCU", tipo: "Inidoneos", situacao: "NADA CONSTA", descricao: "Consulta TCU" },
            { emissor: "CGU", tipo: "CEIS", situacao: "NÃO CONSTA", descricao: "Consulta CEIS" }
          ]
        }),
        { status: 200 },
      );
    },
  });

  const result = await provider.check("00.000.000/0001-91");
  assert.equal(result.ok, true);
  assert.equal(result.data.company.legalName, "EMPRESA TESTE SA");
  assert.equal(result.data.certificates.length, 2);
  assert.equal(result.data.summary.reviewRequired, 0);
  assert.match(urls[0], /seEmitirPDF=false/);
});

test("unknown/adverse-looking statuses are routed to review, not declared guilty", () => {
  const result = summarizeCertificates([
    { status: "REGISTRO LOCALIZADO", description: "Ver detalhes" },
  ]);
  assert.equal(result.reviewRequired, 1);
  assert.match(result.interpretation, /human\/legal review/i);
});
