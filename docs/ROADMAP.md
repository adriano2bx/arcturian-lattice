# Phase 1 — 12 stable MCP tools

The goal is not to expose hundreds of raw upstream endpoints. Hermes sees a compact capability surface; each tool may orchestrate multiple internal providers.

1. `company.validate_cnpj` — numeric + 2026 alphanumeric validation.
2. `company.profile` — normalized cadastral profile with provenance.
3. `company.risk` — CEIS/CNEP/CEPIM/TCU consolidated risk checks.
4. `company.public_contracts` — PNCP contracts, awards and procurement signals.
5. `company.legal` — legal/publication summary through the Judiciário BR capability.
6. `company.ip` — trademarks/patents/software/public IP signals.
7. `web.profile` — crawl, metadata, DNS and public digital footprint.
8. `web.history` — Wayback/history comparison and detected changes.
9. `web.technology` — CMS/framework/analytics/CDN/marketing stack detection.
10. `news.company` — recent company events and media mentions.
11. `market.company` — sector/geography/public market indicators.
12. `osint.company` — orchestrated public-source company dossier.

## Provider principle

Every result carries source, observation time, confidence and whether it is observed, derived or estimated. No estimated value is represented as authoritative.
