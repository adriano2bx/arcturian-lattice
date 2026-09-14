---
name: icp-definition-validation
description: Defines and validates an ideal customer profile from observable company, sector, territory and procurement evidence.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "sales"
  workflow: "icp-validation"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# ICP Definition and Validation

## Objective
Turn an explicit commercial hypothesis into a measurable, evidence-backed ICP.

## When to use / When not to use
Use for account selection and territory planning. Do not infer willingness to buy,
private budget or personal attributes.

## Inputs
`hypothesis`, `sectors[]`, optional `territories[]`, `cnaes[]`, `sampleCnpjs[]` and `criteria[]`.

## Preconditions
Define inclusion/exclusion criteria before collecting evidence and separate fit from intent.

## Workflow
1. Validate sample CNPJs with `company.validate_cnpj` and resolve profiles with `company.profile`.
2. Use `market.ibge` for sector and territory context when available.
3. Use `company.public_contracts` for public-sector hypotheses only.
4. Enrich representative domains with `web.profile`; preserve sampling limits.
5. Compare observed patterns against criteria and report support, contradiction and gaps.

## Evidence and validation
Official records are level A; direct web observations level B; ICP score and
thresholds are level C. A sample is not a population estimate.

## Decision rules
Recommend `validated`, `revise` or `insufficient-evidence`; never optimize a score
against an unverified conversion assumption.

## Output contract
Return `hypothesis`, `criteria[]`, `sample[]`, `supportingEvidence[]`, `contradictions[]`,
`gaps[]`, `recommendation`, `coverage` and `confidence`.

## Failure handling
Keep criteria with missing evidence explicitly marked unknown; do not treat provider
failure as negative fit.

## Privacy and safety
Use company-level public data only; do not profile individuals.

## Tool mapping
`company.validate_cnpj`, `company.profile`, `market.ibge`, `company.public_contracts`, `web.profile`

## Examples and tests
Test a sector hypothesis with two territories, an invalid sample CNPJ and an under-sized sample.
