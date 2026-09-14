---
name: seo-indexability-audit
description: Audits crawlability and indexability signals from public pages and sitemaps with reproducible evidence.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "seo"
  workflow: "indexability-architecture"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# SEO Indexability Audit

## Objective
Identify observable indexability and information-architecture issues on a public domain.
## When to use / When not to use
Use for technical SEO diagnosis. Do not claim search-engine indexing status from a crawl sample alone.
## Inputs
`domain`, optional `paths[]`, `sitemapUrl`, `locale` and `sampleLimit`.
## Preconditions
Normalize URLs, bound the sample and record robots/canonical observations when available.
## Workflow
1. Call `web.sitemap` to inventory declared URLs.
2. Call `seo.audit` on representative pages and record metadata findings.
3. Use `web.profile` for redirects, status and canonical-domain context.
4. Group issues by severity, affected sample and reproducibility.
5. Return prioritized remediation hypotheses; the agent decides implementation.
## Evidence and validation
Direct page/sitemap observations are level B; severity prioritization is level C.
## Decision rules
Distinguish `observed`, `sampled` and `unknown`; never infer deindexing or traffic loss.
## Output contract
Return `domain`, `sample`, `issues[]`, `coverage`, `recommendations[]`, `gaps[]`, `evidence[]` and `confidence`.
## Failure handling
Return partial audit and sample limits when pages fail; no synthetic crawl results.
## Privacy and safety
Public pages only; respect rate limits and do not bypass access controls.
## Tool mapping
`web.sitemap`, `seo.audit`, `web.profile`
## Examples and tests
Test valid sitemap, missing sitemap, canonical conflict, redirect and sampled timeout.
