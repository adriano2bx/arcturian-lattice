---
name: backlink-intelligence
description: Analyzes the locally accumulated backlink graph for a domain, including referring domains and link opportunities. Use for link-gap research, authority analysis or outreach planning when local coverage exists.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "seo"
  mcp-server: "arcturian-lattice"
---
# Backlink Intelligence

1. Call `seo.backlinks` and inspect coverage/freshness.
2. Compare domains with `competitive.compare` if needed.
3. Use `web.search` to understand prospective referring sites before recommending outreach.
4. Separate observed links from derived authority conclusions.

If the local link graph is sparse, state that the result is a sample, not a global backlink inventory.

## Arcturian Lattice MCP tools used
`seo.backlinks`, `competitive.compare`, `web.search`

