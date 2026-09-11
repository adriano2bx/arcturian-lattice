import test from "node:test";
import assert from "node:assert/strict";
import { InpiLocalProvider, normalizeIpAsset } from "../src/providers/inpi-local.js";

function fakeDb(rows) {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async all() {
              return { results: rows, sql, params };
            },
          };
        },
      };
    },
  };
}

test("INPI local provider queries D1 mirror by CNPJ", async () => {
  const provider = new InpiLocalProvider({
    db: fakeDb([{ asset_type: "trademark", process_number: "900123456", holder_cnpj: "00000000000191", title: "BANCO DO BRASIL", nice_classes_json: '["36"]' }]),
    now: () => new Date("2026-09-11T20:00:00Z"),
  });
  const result = await provider.searchByCompany({ cnpj: "00.000.000/0001-91" });
  assert.equal(result.ok, true);
  assert.equal(result.assets[0].processNumber, "900123456");
  assert.deepEqual(result.assets[0].niceClasses, ["36"]);
  assert.equal(result.dataset.source, "INPI");
});

test("INPI local provider fails safely when D1 is not configured", async () => {
  const provider = new InpiLocalProvider();
  const result = await provider.searchByCompany({ cnpj: "00.000.000/0001-91" });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "dataset_not_configured");
});

test("normalizes malformed nice class JSON as empty list", () => {
  const result = normalizeIpAsset({ holder_cnpj: "00000000000191", nice_classes_json: "not json" });
  assert.deepEqual(result.niceClasses, []);
});
