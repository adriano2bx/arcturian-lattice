---
name: intellectual-property-intelligence
description: Analyzes locally mirrored official INPI records for company trademarks, patents and other IP signals. Use for brand portfolio review, product-launch signals, competitive monitoring or IP due diligence.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "company-intelligence"
  mcp-server: "arcturian-lattice"
---
# Intellectual Property Intelligence

1. Resolve company identity with `company.profile`.
2. Call `company.ip`; if the mirror reports stale/missing data, say so.
3. Group assets by type, status, filing date, grant date and Nice classes where present.
4. Use `web.history` and `news.search` to correlate new filings with launches or repositioning.
5. Treat filings as strategic signals, not proof that a product will launch or that a claim is enforceable.

Return active portfolio, recent filings, notable status changes, possible product/brand signals and freshness of the local mirror.

## Arcturian Lattice MCP tools used
`company.ip`, `company.profile`, `web.history`, `news.search`

