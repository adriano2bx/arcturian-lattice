# Provider matrix

| Capability | Primary implementation | Cost requirement | Deployment class |
|---|---|---|---|
| CNPJ profile | public provider bootstrap + future Receita mirror | no paid API | Worker / D1 |
| Public contracts | PNCP | none | Worker |
| Integrity/risk | TCU consolidated certificates | none | Worker |
| Judicial | Judiciario BR MCP | internal | Worker -> MCP |
| IP | INPI official dataset mirror | none | D1 ingestion |
| Municipal company data | Querido Diario | none | Worker |
| Global entity | GLEIF | none | Worker |
| Domain/DNS | HTTP + Cloudflare DoH + RDAP | none | Worker |
| Historical web | Wayback CDX | none | Worker |
| Technology | internal fingerprints | none | Worker |
| Search/SERP | SearXNG | self-host infra | sidecar |
| Backlinks | accumulated D1 graph | self-owned data | D1 |
| Research | Crossref + OpenAlex optional free key | free tier / mirror option | Worker |
| News | GDELT | none | Worker |
| Market demographics | IBGE SIDRA | none | Worker |
| Weather | Open-Meteo | none for normal public use | Worker |
| YouTube metadata | oEmbed | none | Worker |
| YouTube transcript | self-hosted transcript service; Kome opt-in fallback | self-host infra | sidecar |
| Reddit | public JSON surface | none, subject to upstream controls | Worker |
| BCB | SGS | none | Worker |
| SEC | EDGAR data APIs | none; valid User-Agent required | Worker |
| Crypto | Coinbase public rates | none | Worker |
| Network intel | RIPEstat + PeeringDB | none | Worker |
| Subdomains | certificate transparency | none | Worker |
| Geo | Nominatim | self-host recommended | sidecar |
| Regulatory | official dataset mirrors | none | D1/R2 ingestion |
| Traffic estimate | local calibrated model only | self-owned ground truth | D1/model |
| Continuous intelligence | D1 + Cron | Cloudflare quota | Worker/D1 |
