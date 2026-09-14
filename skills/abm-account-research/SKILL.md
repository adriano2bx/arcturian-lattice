---
name: abm-account-research
description: Creates an account-based marketing research brief for a target company by combining company, web, technology, market, news and competitive signals. Use before strategic outbound, enterprise sales, partnership outreach or custom proposals.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "go-to-market"
  mcp-server: "arcturian-lattice"
---
# ABM Account Research

1. Establish entity identity with `company.profile` or `company.osint`.
2. Profile website and stack with `web.profile` + `web.technology`.
3. Review recent `news.search` and `competitive.snapshot`.
4. Add `company.public_contracts` or `regulatory.search` only when relevant to the account.
5. Derive business hypotheses from evidence: likely priorities, change signals, integration opportunities, procurement context and competitive pressure.

## Output
Account summary, verified facts, strategic hypotheses, likely buying triggers, personalized value angles, discovery questions and evidence links. Never fabricate employee names, budgets, intent or pain.

## Arcturian Lattice MCP tools used
`company.osint`, `company.profile`, `web.profile`, `web.technology`, `news.search`, `competitive.snapshot`, `company.public_contracts`, `regulatory.search`

