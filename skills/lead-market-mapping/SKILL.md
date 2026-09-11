---
name: lead-market-mapping
description: Maps target-market segments and company opportunities using Brazilian market data, public company intelligence, geography and web research. Use for ICP design, territory planning or lead-list strategy.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "go-to-market"
  mcp-server: "nexus-intelligence-mcp"
---
# Lead Market Mapping

1. Define ICP criteria: sector, geography, size proxies, regulatory status and digital signals.
2. Size the territory with `market.ibge` and `market.open_data`.
3. Resolve places with `geo.search`.
4. Use `web.search` and `company.osint` to identify and validate candidate companies.
5. Add sector-specific `regulatory.search` where it improves precision.
6. Rank leads by observable fit and trigger signals, not unverifiable intent.

Return segment map, prioritization logic, candidate accounts, evidence and data gaps.

## Nexus MCP tools used
`market.ibge`, `market.open_data`, `geo.search`, `web.search`, `company.osint`, `regulatory.search`

