/**
 * CNPJ validator compatible with the alphanumeric format introduced in 2026.
 * Rule: first 12 positions are alphanumeric; final two positions are numeric DVs.
 * DV character value = ASCII code - 48, followed by modulo-11.
 */

const FIRST_DV_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_DV_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export class CnpjError extends Error {
  constructor(message, code = "INVALID_CNPJ") {
    super(message);
    this.name = "CnpjError";
    this.code = code;
  }
}

export function normalizeCnpj(input) {
  if (typeof input !== "string") {
    throw new CnpjError("CNPJ must be a string.");
  }

  const normalized = input
    .trim()
    .toUpperCase()
    .replace(/[.\-/\s]/g, "");

  if (normalized.length !== 14) {
    throw new CnpjError("CNPJ must contain 14 characters after formatting is removed.");
  }

  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(normalized)) {
    throw new CnpjError(
      "CNPJ must have 12 alphanumeric base characters followed by 2 numeric check digits.",
    );
  }

  return normalized;
}

export function formatCnpj(input) {
  const cnpj = normalizeCnpj(input);
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}

function characterValue(character) {
  return character.charCodeAt(0) - 48;
}

function calculateDigit(characters, weights) {
  const total = characters.reduce(
    (sum, character, index) => sum + characterValue(character) * weights[index],
    0,
  );
  const remainder = total % 11;
  return remainder === 0 || remainder === 1 ? 0 : 11 - remainder;
}

export function calculateCnpjCheckDigits(base) {
  if (typeof base !== "string") {
    throw new CnpjError("CNPJ base must be a string.");
  }

  const normalizedBase = base
    .trim()
    .toUpperCase()
    .replace(/[.\-/\s]/g, "");

  if (!/^[A-Z0-9]{12}$/.test(normalizedBase)) {
    throw new CnpjError("CNPJ base must contain exactly 12 alphanumeric characters.");
  }

  const first = calculateDigit([...normalizedBase], FIRST_DV_WEIGHTS);
  const second = calculateDigit([...normalizedBase, String(first)], SECOND_DV_WEIGHTS);
  return `${first}${second}`;
}

export function isValidCnpj(input) {
  let cnpj;
  try {
    cnpj = normalizeCnpj(input);
  } catch {
    return false;
  }

  // Repeated full identifiers are not valid business identifiers.
  if (/^([A-Z0-9])\1{13}$/.test(cnpj)) {
    return false;
  }

  return calculateCnpjCheckDigits(cnpj.slice(0, 12)) === cnpj.slice(12);
}

export function describeCnpj(input) {
  const normalized = normalizeCnpj(input);
  return {
    normalized,
    formatted: formatCnpj(normalized),
    valid: isValidCnpj(normalized),
    format: /[A-Z]/.test(normalized.slice(0, 12)) ? "alphanumeric" : "numeric",
    root: normalized.slice(0, 8),
    establishment: normalized.slice(8, 12),
    checkDigits: normalized.slice(12),
  };
}
