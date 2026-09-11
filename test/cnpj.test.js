import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCnpjCheckDigits,
  describeCnpj,
  formatCnpj,
  isValidCnpj,
  normalizeCnpj,
} from "../src/core/cnpj.js";

test("normalizes a formatted numeric CNPJ", () => {
  assert.equal(normalizeCnpj("00.000.000/0001-91"), "00000000000191");
});

test("normalizes a formatted alphanumeric CNPJ", () => {
  assert.equal(normalizeCnpj("00.000.000/E08G-12"), "00000000E08G12");
});

test("implements the official alphanumeric DV example", () => {
  assert.equal(calculateCnpjCheckDigits("12ABC34501DE"), "35");
  assert.equal(isValidCnpj("12.ABC.345/01DE-35"), true);
});

test("validates the first alphanumeric CNPJ announced by Receita Federal", () => {
  assert.equal(calculateCnpjCheckDigits("00000000E08G"), "12");
  assert.equal(isValidCnpj("00.000.000/E08G-12"), true);
});

test("keeps existing numeric CNPJs valid", () => {
  assert.equal(isValidCnpj("00.000.000/0001-91"), true);
});

test("rejects bad check digits", () => {
  assert.equal(isValidCnpj("00.000.000/0001-90"), false);
});

test("describes and formats an alphanumeric CNPJ", () => {
  const result = describeCnpj("00000000e08g12");
  assert.equal(result.format, "alphanumeric");
  assert.equal(result.formatted, "00.000.000/E08G-12");
  assert.equal(formatCnpj(result.normalized), "00.000.000/E08G-12");
});
