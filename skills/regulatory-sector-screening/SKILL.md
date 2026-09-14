---
name: regulatory-sector-screening
description: Screens a regulated Brazilian entity across official mirrored regulator datasets with sector and coverage controls.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "regulatory"
  workflow: "sector-screening"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Regulatory Sector Screening

## Objective
Identify public regulatory records relevant to an entity and sector for human review.
## When to use / When not to use
Use for onboarding and compliance context. Do not declare compliance, violation or sanction from a search hit.
## Inputs
`entity`, optional `cnpj`, `sectors[]`, `sources[]`, `dateFrom`, `dateTo`, `limit`.
## Preconditions
Choose regulator sources from the supported catalog and resolve the entity identity.
## Workflow
1. Call `regulatory.search` with explicit sources and bounded terms.
2. Normalize regulator, record type, identifier, date, status and source URL.
3. Deduplicate records and separate direct matches from name-only candidates.
4. Return findings grouped by regulator with coverage and review questions.
## Evidence and validation
Mirrored official records are level A with mirror freshness disclosed; matching is level C.
## Decision rules
Use `review_required`, `no_observation` or `partial`; never convert no result into clearance.
## Output contract
Return `entity`, `records[]`, `sourceCoverage`, `gaps[]`, `evidence[]`, `reviewQuestions[]` and `confidence`.
## Failure handling
Preserve successful regulator responses and expose stale/unavailable mirrors.
## Privacy and safety
Use public business records and avoid profiling individuals.
## Tool mapping
`regulatory.search`, `company.profile`
## Examples and tests
Test multi-regulator search, name collision, stale mirror and empty source response.
