---
name: competitive-intelligence
description: Builds multi-source competitor snapshots and compares domains using derived Digital Visibility signals. Use for competitor benchmarking, strategic positioning, market monitoring or executive competitive analysis.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "competitive"
  mcp-server: "arcturian-lattice"
---
# Competitive Intelligence

1. Define the comparison set and market context.
2. Run `competitive.snapshot` for each domain or `competitive.compare` for 2–5 domains.
3. Use `web.history`, `seo.serp`, `social.search_mentions` and `news.search` to explain differences.
4. Call `competitive.traffic_estimate` only when useful. If it returns unavailable because no calibrated model exists, do not manufacture a substitute number.
5. Convert findings into strategic moves: defend, exploit gap, monitor, test.

Always label Digital Visibility as a derived internal score, not an industry-standard audience measurement.

## Arcturian Lattice MCP tools used
`competitive.snapshot`, `competitive.compare`, `competitive.traffic_estimate`, `web.history`, `news.search`, `seo.serp`, `social.search_mentions`

