---
name: news-event-intelligence
description: Finds and synthesizes recent company, sector and geopolitical news events using GDELT and web research. Use for event detection, competitive moves, partnership tracking, crisis context or market briefings.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "research"
  mcp-server: "arcturian-lattice"
---
# News and Event Intelligence

1. Use `news.search` with a bounded timespan.
2. Use `web.search` or `research.deep` to triangulate material events.
3. Deduplicate syndication and near-identical stories.
4. Separate confirmed event, reporting claim and analyst inference.
5. Build a timeline when multiple events interact.

For sensitive allegations, require multiple credible sources and use cautious language.

## Arcturian Lattice MCP tools used
`news.search`, `research.deep`, `web.search`

