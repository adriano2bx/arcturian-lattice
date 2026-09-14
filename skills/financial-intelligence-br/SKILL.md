---
name: financial-intelligence-br
description: Researches Brazilian macro and financial indicators using official Banco Central series and local regulatory datasets. Use for economic context, rate/inflation analysis, regulated-company research or executive briefings.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "finance"
  mcp-server: "arcturian-lattice"
---
# Brazilian Financial Intelligence

1. Identify the correct SGS series codes before drawing conclusions.
2. Use `finance.bcb_series` for official time series.
3. Add `regulatory.search` for relevant mirrored regulatory records and `market.ibge` for structural context.
4. Use `news.search` only for event explanation.
5. Report period, units, source and transformations.

Do not provide real-time exchange/security prices unless a tool explicitly supplies them.

## Arcturian Lattice MCP tools used
`finance.bcb_series`, `regulatory.search`, `market.ibge`, `news.search`

