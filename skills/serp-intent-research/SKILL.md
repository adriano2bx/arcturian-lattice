---
name: serp-intent-research
description: Maps search results to user intent and opportunity using reproducible SERP observations and technical page evidence.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "seo"
  workflow: "serp-intent"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# SERP Intent Research

## Objective
Classify observable search-result intent and identify evidence-backed content opportunities.

## When to use / When not to use
Use for SEO planning and landing-page discovery. Do not present rank samples as
stable market share or guarantee traffic.

## Inputs
`queries[]`, optional `locale`, `device`, `competitors[]` and `dateObserved`.

## Preconditions
Deduplicate queries, define language/location, and record the SERP provider and limits.

## Workflow
1. Call `seo.serp` for each bounded query set.
2. Normalize result URLs and classify intent as informational, navigational,
   commercial or transactional using visible evidence.
3. Inspect representative pages with `web.profile` and `seo.audit`.
4. Group queries by intent, entity and customer problem.
5. Prioritize opportunities by relevance, observed coverage and effort; label hypotheses.

## Evidence and validation
SERP results and page observations are level B; intent grouping is level C.
Capture query, locale, timestamp, position sample and source URL.

## Decision rules
Never infer volume, conversion or future rank without a calibrated source. Conflicting
SERPs remain separate by locale/device/date.

## Output contract
Return `queries[]`, `clusters[]`, `resultObservations[]`, `coverage`, `opportunities[]`,
`limitations[]`, `evidence[]` and `confidence`.

## Failure handling
Return partial clusters when a query fails; do not replace missing SERP data with zero results.

## Privacy and safety
Use public search data and avoid personal query profiling or automated publishing.

## Tool mapping
`seo.serp`, `web.profile`, `seo.audit`

## Examples and tests
Test mixed-intent queries, locale-specific results, duplicate URLs and provider limits.
