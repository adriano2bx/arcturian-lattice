---
name: seo-competitive-research
description: Compares competitors in search using self-hosted SERP search, technical SEO observations, backlinks and web evidence. Use for keyword opportunity discovery, competitive SEO strategy or search-market mapping.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "seo"
  mcp-server: "arcturian-lattice"
---
# Competitive SEO Research

1. Define the commercial topic, geography and language.
2. Use `seo.serp` for representative queries.
3. Audit relevant ranking pages with `seo.audit`.
4. Use `seo.backlinks` when the local link graph has coverage.
5. Compare target domains through `competitive.compare`.
6. Build opportunity clusters from observed SERPs: transactional, comparison, informational and branded.

Always disclose when SearXNG or the local backlink graph has partial coverage. Do not label a query's exact search volume unless a verified source provides it.

## Arcturian Lattice MCP tools used
`seo.serp`, `seo.audit`, `seo.backlinks`, `web.search`, `competitive.compare`

