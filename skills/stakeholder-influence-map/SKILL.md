---
name: stakeholder-influence-map
description: Maps publicly observable organizational roles, entities and influence signals for an account without inventing people or authority.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "sales"
  workflow: "stakeholder-influence"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Stakeholder and Influence Map

## Objective
Prepare a discovery map of publicly observable departments, entities, roles and influence signals.

## When to use / When not to use
Use for account planning and meeting preparation. Do not infer a person's authority,
intent, contact details or private affiliation from a name or job title.

## Inputs
`account`, optional `domain`, `topics[]`, `knownRoles[]` and `question`.

## Preconditions
Resolve the organization identity and define the business decision being mapped.

## Workflow
1. Call `company.profile` or `company.osint` to establish the organization.
2. Inspect `web.profile` and `web.sitemap` for public departments, products and contact paths.
3. Use `news.search` and `web.search` for dated announcements, partnerships and official role mentions.
4. Group observations by function, initiative, external entity and evidence date.
5. Label each node `observed`, `derived` or `unknown`; generate discovery questions, not outreach.

## Evidence and validation
Official pages and public reporting are level A/B; relationship and influence hypotheses are level C.
Require a source URL and date for every named person or organizational relationship.

## Decision rules
Never rank an individual as a decision-maker without explicit public evidence. If evidence
is sparse, return an organizational map with unknown roles rather than filling gaps.

## Output contract
Return `account`, `nodes[]`, `relationships[]`, `signals[]`, `unknowns[]`, `questions[]`,
`evidence[]`, `gaps[]` and `confidence`.

## Failure handling
Preserve identity and web evidence when news/search fails; mark the affected edges unknown.

## Privacy and safety
Use only necessary public professional information; do not collect personal contact data or doxx.

## Tool mapping
`company.profile`, `company.osint`, `web.profile`, `web.sitemap`, `news.search`, `web.search`

## Examples and tests
Test an organization with public departments, an entity with only legal identity and a homonym.
