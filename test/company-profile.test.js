import test from "node:test";
import assert from "node:assert/strict";
import { CompanyProfileService, CompanyProfileError } from "../src/services/company-profile.js";

function fakeProvider({ id = "fake", supports = () => true, result }) {
  return {
    id,
    supports,
    async getProfile() {
      return result;
    },
  };
}

test("uses fallback providers and records provenance", async () => {
  const service = new CompanyProfileService({
    providers: [
      fakeProvider({ id: "first", result: { ok: false, provider: "first", reason: "not_found", status: 404 } }),
      fakeProvider({
        id: "second",
        result: {
          ok: true,
          provider: "second",
          profile: { document: { cnpj: "00000000000191" }, identity: { legalName: "BANCO DO BRASIL SA" } },
        },
      }),
    ],
    now: () => new Date("2026-09-11T22:00:00.000Z"),
  });

  const profile = await service.getByCnpj("00.000.000/0001-91");
  assert.equal(profile.identity.legalName, "BANCO DO BRASIL SA");
  assert.equal(profile.meta.source, "second");
  assert.equal(profile.meta.confidence, 0.9);
  assert.equal(profile.meta.attempts.length, 2);
});

test("rejects a mathematically invalid CNPJ before calling providers", async () => {
  let called = false;
  const service = new CompanyProfileService({
    providers: [
      fakeProvider({
        result: { ok: true, provider: "fake", profile: {} },
        supports: () => {
          called = true;
          return true;
        },
      }),
    ],
  });

  await assert.rejects(
    () => service.getByCnpj("00.000.000/0001-90"),
    (error) => error instanceof CompanyProfileError && error.code === "INVALID_CNPJ",
  );
  assert.equal(called, false);
});

test("returns an explicit gap for alphanumeric CNPJ when no provider supports it", async () => {
  const service = new CompanyProfileService({
    providers: [
      fakeProvider({
        id: "numeric-only",
        supports: (cnpj) => /^\d+$/.test(cnpj),
        result: { ok: false, provider: "numeric-only", reason: "not_found" },
      }),
    ],
  });

  await assert.rejects(
    () => service.getByCnpj("00.000.000/E08G-12"),
    (error) =>
      error instanceof CompanyProfileError &&
      error.code === "NO_PROVIDER_FOR_FORMAT" &&
      error.details.document.format === "alphanumeric",
  );
});
