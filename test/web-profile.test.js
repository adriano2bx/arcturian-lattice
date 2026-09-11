import test from "node:test";
import assert from "node:assert/strict";
import { WebProfileService, normalizeDomainInput } from "../src/services/web-profile.js";
import { extractHtmlSignals } from "../src/providers/web-http.js";
import { findServiceUrl, normalizeRdap } from "../src/providers/rdap.js";

test("normalizes URL and strips www", () => {
  assert.equal(normalizeDomainInput("https://www.Example.com/path"), "example.com");
  assert.equal(normalizeDomainInput("example.com"), "example.com");
});

test("extracts common HTML metadata", () => {
  const html = '<html lang="pt-BR"><head><title>Acme &amp; Co</title><meta name="description" content="Teste"><link rel="canonical" href="https://acme.test/"><meta property="og:title" content="OG"></head><body><h1>Olá <span>Mundo</span></h1></body></html>';
  const out = extractHtmlSignals(html);
  assert.equal(out.title, "Acme & Co");
  assert.equal(out.description, "Teste");
  assert.equal(out.canonical, "https://acme.test/");
  assert.equal(out.h1, "Olá Mundo");
  assert.equal(out.openGraph.title, "OG");
});

test("finds RDAP server from IANA bootstrap", () => {
  const bootstrap = { services: [[['br'], ['https://rdap.registro.br/']], [['com'], ['https://rdap.verisign.com/com/v1/']]] };
  assert.equal(findServiceUrl(bootstrap, "br"), "https://rdap.registro.br/");
});

test("normalizes RDAP payload", () => {
  const out = normalizeRdap({
    handle: "x",
    ldhName: "example.com",
    status: ["active"],
    events: [{ eventAction: "registration", eventDate: "2020-01-01" }],
    nameservers: [{ ldhName: "ns1.example.com" }],
    entities: [{ handle: "REG", roles: ["registrar"] }],
  });
  assert.equal(out.ldhName, "example.com");
  assert.equal(out.events.registration, "2020-01-01");
  assert.deepEqual(out.nameservers, ["ns1.example.com"]);
});

test("web profile returns partial_success when one provider fails", async () => {
  const service = new WebProfileService({
    httpProvider: { inspect: async () => ({ ok: true, provider: "http", data: { status: 200 } }) },
    dnsProvider: { lookup: async () => ({ ok: false, provider: "dns", reason: "timeout" }) },
    rdapProvider: { domain: async () => ({ ok: true, provider: "rdap", data: { ldhName: "example.com" } }) },
  });
  const out = await service.inspect("example.com");
  assert.equal(out.status, "partial_success");
  assert.equal(out.warnings[0].provider, "dns");
  assert.equal(out.sources.length, 3);
});
