import test from "node:test";
import assert from "node:assert/strict";
import { BrasilApiCnpjProvider } from "../src/providers/brasilapi.js";

const enabled = process.env.LIVE_TEST === "1";

test("live BrasilAPI lookup for Banco do Brasil", { skip: !enabled }, async () => {
  const provider = new BrasilApiCnpjProvider();
  const result = await provider.getProfile("00000000000191");
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.match(result.profile.identity.legalName ?? "", /BANCO DO BRASIL/i);
});
