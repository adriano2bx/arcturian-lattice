---
name: public-company-intelligence-us
description: Analyzes US public-company filings and XBRL facts using official SEC EDGAR data. Use for company fundamentals, filing history, risk-factor research or cross-border competitive intelligence.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "finance"
  mcp-server: "arcturian-lattice"
---
# US Public Company Intelligence

1. Resolve the company's SEC CIK externally or from known context.
2. Use `finance.sec_companyfacts` for XBRL facts and `finance.sec_submissions` for filing history.
3. Use `news.search` for recent context.
4. Cite filing periods and distinguish reported facts from analysis.

Never imply that SEC filing presence is equivalent to investment advice.

## Arcturian Lattice MCP tools used
`finance.sec_companyfacts`, `finance.sec_submissions`, `news.search`

