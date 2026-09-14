---
name: company-identity-reconciliation
description: Reconciles a Brazilian company identity across CNPJ, legal name, domain and public records before downstream research.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "company-intelligence"
  workflow: "identity-reconciliation"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Company Identity Reconciliation

## Objective
Produce one canonical entity record and an explicit ambiguity report.

## When to use / When not to use
Use before combining sources for a company. Do not merge records based only on
similar names, shared addresses or an unverified domain.

## Inputs
`cnpj`, `legalName`, `tradeName` and/or `domain`; at least one identifier is required.

## Preconditions
Normalize CNPJ and URL; preserve the original values; define the observation date.

## Workflow
1. Validate a supplied CNPJ with `company.validate_cnpj`.
2. Resolve official identity with `company.profile`.
3. Query `company.osint` using the strongest resolved identifier.
4. Observe `web.profile` and `web.sitemap` only for the candidate official domain.
5. Compare legal name, aliases, location, activities, domain and source dates.
6. Assign `confirmed`, `probable`, `ambiguous` or `unresolved`; never silently merge.

## Evidence and validation
Official registration is level A; direct domain observations are level B;
correlation is level C. Every match must include source, field and observedAt.

## Decision rules
Require two independent matching dimensions for `probable` and a direct official
link or registration match for `confirmed`. Any material conflict caps confidence low.

## Output contract
Return `status`, `canonicalEntity`, `candidates[]`, `matches[]`, `conflicts[]`,
`evidence[]`, `gaps[]` and `confidence`.

## Failure handling
Return `partial` on provider failure and retain each unmerged candidate. Retry a
transient read once; never infer missing registration data.

## Privacy and safety
Use public business data only; do not identify private individuals or infer ownership.

## Tool mapping
`company.validate_cnpj`, `company.profile`, `company.osint`, `web.profile`, `web.sitemap`

## Examples and tests
Test a valid CNPJ/domain pair, a homonymous name, and a domain unrelated to the CNPJ.
