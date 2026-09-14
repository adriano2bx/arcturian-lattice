---
name: seo-technical-audit
description: Performs a technical and on-page SEO audit using direct public page observations. Use when diagnosing crawlability, metadata, canonical, heading, indexability or basic page-quality issues.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "seo"
  mcp-server: "arcturian-lattice"
---
# Technical SEO Audit

1. Audit priority URLs with `seo.audit`.
2. Inspect site-level discoverability with `web.sitemap` and `web.profile`.
3. Classify findings: critical, high, medium, low.
4. Separate direct observation from recommendations.
5. Prioritize fixes by expected impact and implementation effort.

Do not invent Core Web Vitals or Search Console metrics unless they are actually available from another authorized source.

## Arcturian Lattice MCP tools used
`seo.audit`, `web.sitemap`, `web.profile`

