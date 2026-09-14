---
name: company-osint-br
description: Investigates a Brazilian company from public and official sources, correlating CNPJ, web, gazette, regulatory, legal and infrastructure signals. Use for OSINT, business intelligence, prospect research or entity verification.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "company-intelligence"
  mcp-server: "arcturian-lattice"
---
# Brazilian Company OSINT

## Procedure
1. Start with `company.profile` or `company.osint`.
2. Add `company.gazette` for municipal-publication context and `company.global` when an international LEI connection may exist.
3. Query `regulatory.search` only for sectors relevant to the company.
4. Profile the official domain with `web.profile`; discover public subdomain signals with `osint.subdomains`.
5. Use `infra.network` only on public IP resources discovered through legitimate observation.
6. Correlate entity names, domains, dates and identifiers. Mark uncertain entity matches explicitly.

## Output
Provide a timeline, entity graph, verified identifiers, public digital assets, regulatory footprint, anomalies, unresolved ambiguities and a source table with confidence.

## Arcturian Lattice MCP tools used
`company.osint`, `company.profile`, `company.gazette`, `company.global`, `regulatory.search`, `web.profile`, `osint.subdomains`, `infra.network`

