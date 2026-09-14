---
name: company-registration-verification
description: Verifies Brazilian company registration data and returns a source-dated identity record with explicit coverage gaps.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "company-intelligence"
  workflow: "registration-verification"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Company Registration Verification

## Objective
Verify a supplied CNPJ and summarize normalized registration facts for downstream decisions.

## When to use / When not to use
Use for onboarding, supplier checks and identity gates. Do not infer solvency,
ownership, fraud or current operations from registration fields alone.

## Inputs
`cnpj` is required; optional `requiredStatus`, `expectedName` and `expectedUf`.

## Preconditions
Preserve the raw CNPJ, normalize punctuation and validate check digits first.

## Workflow
1. Call `company.validate_cnpj`; stop with a typed invalid result when it fails.
2. Call `company.profile` and retain provider provenance and observation time.
3. Compare expected fields with the returned identity without overwriting either value.
4. Mark each check `match`, `mismatch` or `unknown` and expose provider gaps.

## Evidence and validation
Registration/provider records are level A when sourced from official data; derived
comparisons are level C. Do not silently combine conflicting provider values.

## Decision rules
Return `verified` only when identity and requested fields match; otherwise `review` or
`invalid`. Absence of a field is not a negative finding.

## Output contract
Return `status`, `identity`, `checks[]`, `provenance`, `observedAt`, `gaps[]` and `confidence`.

## Failure handling
Preserve validation output if profile lookup fails; retry a transient provider once.

## Privacy and safety
Use business registration data only and limit retention to the stated decision.

## Tool mapping
`company.validate_cnpj`, `company.profile`

## Examples and tests
Test valid numeric/alphanumeric CNPJ, invalid check digits and provider disagreement.
