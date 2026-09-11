---
name: public-procurement-intelligence
description: Analyzes Brazilian public procurement and contract exposure around a company. Use to find government customers, contract history, procurement signals, public-sector opportunities or supplier concentration.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "go-to-market"
  mcp-server: "nexus-intelligence-mcp"
---
# Public Procurement Intelligence

## Workflow
1. Resolve and validate the company with `company.profile`.
2. Query `company.public_contracts` as `supplier` over the requested period; paginate deliberately when the result set is large.
3. When investigating a public entity, query using role `organization`.
4. Group by contracting body, object, value, date, geography and recurrence.
5. Use `news.search` only to explain context, not to override official contract records.
6. Use `market.ibge` when regional market sizing improves the opportunity analysis.

## Deliverables
Contract history, public-sector concentration, recurring buyers, likely renewal windows, product/service themes, regions, opportunity signals and caveats about incomplete date coverage.

## Nexus MCP tools used
`company.public_contracts`, `company.profile`, `news.search`, `market.ibge`

