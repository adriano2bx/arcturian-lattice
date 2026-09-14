---
name: entity-news-panorama
description: Produces a dated, source-linked panorama of news about an entity while separating observation from interpretation.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "research"
  workflow: "entity-news-panorama"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Entity News Panorama

## Objective
Summarize recent public coverage of an entity with deduplication, source quality and gaps.

## When to use / When not to use
Use for executive, sales or risk context. Do not equate volume with sentiment,
importance or wrongdoing.

## Inputs
`entity`, optional `aliases[]`, `topics[]`, `dateFrom`, `dateTo` and `locale`.

## Preconditions
Resolve legal/trade names and define the date window, language and source scope.

## Workflow
1. Call `news.search` with the canonical name and carefully bounded aliases.
2. Normalize URL, publisher, publication date and headline; deduplicate syndicated copies.
3. Cluster items by topic and distinguish reporting, opinion and announcement.
4. Validate material claims with `web.search` when available.
5. Produce a timeline and unresolved questions; the agent decides escalation or monitoring.

## Evidence and validation
News items are level B public observations; topic clusters are level C. Preserve
publication and observation dates and never quote snippets as verified facts.

## Decision rules
Use `material`, `contextual` or `uncertain`; low source diversity caps confidence.

## Output contract
Return `entity`, `window`, `items[]`, `clusters[]`, `timeline[]`, `sourceDiversity`,
`gaps[]`, `evidence[]` and `confidence`.

## Failure handling
Return partial results and provider metadata; an empty result is not proof of no coverage.

## Privacy and safety
Use public reporting, avoid doxxing and do not publish allegations as conclusions.

## Tool mapping
`news.search`, `web.search`

## Examples and tests
Test aliases with homonyms, syndicated duplicates, mixed source quality and an empty window.
