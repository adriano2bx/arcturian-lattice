---
name: legal-publications-party
description: Searches public judicial publications by party with identity disambiguation and explicit tribunal/date coverage.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "legal"
  workflow: "publications-by-party"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Legal Publications by Party

## Objective
Return a disambiguated, dated publication set for a legal party without legal conclusions.
## When to use / When not to use
Use for attorney review and public-risk triage. Do not equate a name hit with a party identity.
## Inputs
`cnpj` or `legalName`, optional `dateFrom`, `dateTo`, `tribunal`, `page`, `pageSize`.
## Preconditions
Prefer CNPJ; otherwise require a legal name and record the ambiguity risk.
## Workflow
1. Resolve identity with `company.profile` when CNPJ is supplied.
2. Call `company.legal` with bounded dates and pagination.
3. Deduplicate by process/publication identifiers and retain source metadata.
4. Reconcile party name, location and identifiers; flag homonyms for review.
## Evidence and validation
Public judicial records are observed evidence; publication presence is not proof of liability.
## Decision rules
Return `identified`, `ambiguous` or `unresolved`; never infer procedural outcome or deadline.
## Output contract
Return `query`, `publications[]`, `identityAssessment`, `coverage`, `gaps[]`, `evidence[]` and `confidence`.
## Failure handling
Return partial pages and a continuation gap; do not report an empty provider response as no cases.
## Privacy and safety
Minimize personal data and restrict use to legitimate legal/compliance purposes.
## Tool mapping
`company.profile`, `company.legal`
## Examples and tests
Test CNPJ match, homonymous legal names, bounded pagination and unavailable tribunal.
