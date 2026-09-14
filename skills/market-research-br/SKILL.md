---
name: market-research-br
description: Builds Brazilian market intelligence from IBGE/SIDRA, mirrored open datasets, company intelligence and geographic context. Use for TAM/SAM framing, regional expansion, vertical research or market-entry analysis.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "market"
  mcp-server: "arcturian-lattice"
---
# Brazilian Market Research

1. Translate the business question into population, sector, geography and time-period variables.
2. Use `market.ibge` for authoritative demographic/economic measures.
3. Use `market.open_data` for locally mirrored COMEXSTAT or aggregated RAIS/CAGED where relevant.
4. Use `geo.search` for geographic entity resolution.
5. Use `company.osint`, `web.search` and `news.search` to map competitors and context.
6. Clearly separate official statistics from web-observed estimates.

Return market definition, demand proxies, regional ranking, competitive density, opportunity thesis and data limitations.

## Arcturian Lattice MCP tools used
`market.ibge`, `market.open_data`, `geo.search`, `company.osint`, `web.search`, `news.search`

