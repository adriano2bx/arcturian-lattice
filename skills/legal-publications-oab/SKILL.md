---
name: legal-publications-oab
description: Searches Brazilian judicial publications by OAB number with coverage, date and identity controls for attorney review.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "legal"
  workflow: "publications-by-oab"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Legal Publications by OAB

## Objective
Deliver a dated, reviewable publication inbox for an OAB query; this is not legal advice.

## When to use / When not to use
Use for an attorney's daily search. Do not claim completeness across tribunals unless
the provider explicitly reports complete coverage.

## Inputs
`oabNumber`, `uf`, `dateFrom`, `dateTo`, optional `tribunal`, `page` and `pageSize`.

## Preconditions
Validate OAB format and UF, require an explicit date window, and record timezone.

## Workflow
1. Call `legal.publications_by_oab` with normalized OAB and bounded pagination.
2. Deduplicate by publication/process identifier plus publication date.
3. Preserve tribunal, source URL, publication date, matched OAB and raw title.
4. Flag partial pages, unavailable tribunals and ambiguous matches.
5. Return an ordered review queue; the agent decides notification and follow-up.

## Evidence and validation
Each item is an observed public publication (level A/B depending on provider).
Never infer deadline, liability, party identity or procedural consequence.

## Decision rules
`complete` is allowed only when provider coverage says complete for the requested
window. Otherwise use `partial` and expose every coverage gap.

## Output contract
Return `status`, `query`, `publications[]`, `coverage`, `duplicatesRemoved`,
`evidence[]`, `gaps[]`, `observedAt` and `confidence`.

## Failure handling
On timeout, return already collected pages with a retry cursor. Do not silently
retry indefinitely or represent an empty response as “no publications”.

## Privacy and safety
Restrict access to the requesting legal team; minimize personal data and retain source links.

## Tool mapping
`legal.publications_by_oab`

## Examples and tests
Test a valid OAB with multiple pages, an invalid UF, an empty-but-partial provider
response and duplicate publications across pages.
