---
name: executive-intelligence-brief
description: Produces a concise executive intelligence brief from company, competitor, market, news and monitoring signals. Use for weekly leadership updates, client strategy meetings or board-style summaries.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "executive"
  mcp-server: "arcturian-lattice"
---
# Executive Intelligence Brief

## Workflow
1. Read recent `monitor.events` first to identify what changed.
2. Use `competitive.compare` for the strategic competitive picture.
3. Use `news.search` for external events.
4. Add `company.osint`, `market.ibge` or `finance.bcb_series` only when they materially affect decisions.

## Output format
- **What changed** — maximum 5 items.
- **Why it matters** — business consequence.
- **Recommended action** — owner and next step.
- **Watch next** — unresolved signals.
- **Evidence quality** — A/B/C/D and freshness.

Keep the brief decision-oriented; move raw research to an appendix.

## Arcturian Lattice MCP tools used
`monitor.events`, `competitive.compare`, `news.search`, `company.osint`, `market.ibge`, `finance.bcb_series`

