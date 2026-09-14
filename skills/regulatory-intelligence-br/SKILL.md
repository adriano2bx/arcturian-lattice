---
name: regulatory-intelligence-br
description: Searches locally mirrored official Brazilian regulatory datasets across CVM, ANS, Anvisa, Anatel, Aneel, ANP and Susep. Use for sector due diligence, regulated-company research, compliance context or vertical market intelligence.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "regulatory"
  mcp-server: "arcturian-lattice"
---
# Brazilian Regulatory Intelligence

1. Resolve company/CNPJ when possible with `company.profile`.
2. Select only the regulator relevant to the sector.
3. Call `regulatory.search`; inspect mirror freshness before relying on absence of records.
4. Use `news.search` for explanatory context only.
5. Report source, update timestamp, record type and limitations.

Never substitute this workflow for formal legal or regulatory advice.

## Arcturian Lattice MCP tools used
`regulatory.search`, `company.profile`, `news.search`

