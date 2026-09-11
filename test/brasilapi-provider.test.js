import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { BrasilApiCnpjProvider } from "../src/providers/brasilapi.js";

const fixture = JSON.parse(
  await fs.readFile(new URL("../fixtures/brasilapi-bank.json", import.meta.url), "utf8"),
);

test("BrasilAPI provider intentionally supports numeric CNPJ only", () => {
  const provider = new BrasilApiCnpjProvider({ fetchFn: async () => { throw new Error("not called"); } });
  assert.equal(provider.supports("00000000000191"), true);
  assert.equal(provider.supports("00000000E08G12"), false);
});

test("normalizes a successful BrasilAPI company profile", async () => {
  const calls = [];
  const provider = new BrasilApiCnpjProvider({
    fetchFn: async (url) => {
      calls.push(url);
      return new Response(JSON.stringify(fixture), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  const result = await provider.getProfile("00000000000191");
  assert.equal(result.ok, true);
  assert.equal(result.profile.identity.legalName, "BANCO DO BRASIL SA");
  assert.equal(result.profile.address.state, "DF");
  assert.equal(result.profile.activities.primary.code, "6422100");
  assert.equal(result.profile.partners.length, 1);
  assert.match(calls[0], /00000000000191$/);
});

test("returns a structured upstream failure", async () => {
  const provider = new BrasilApiCnpjProvider({
    fetchFn: async () => new Response("not found", { status: 404 }),
  });
  const result = await provider.getProfile("00000000000191");
  assert.deepEqual(result, {
    ok: false,
    provider: "brasilapi",
    reason: "not_found",
    status: 404,
  });
});
