# Nexus Intelligence MCP v1.0 — status

## Test status

- Syntax validation: all `src/` and `scripts/` JS/MJS files.
- Deterministic unit/contract tests: provider URL construction, normalization, fallback behavior, CNPJ numeric/alphanumeric validation, PNCP, TCU, Judiciario adapter, INPI local mirror, web profile, SEO, research, social, finance, infrastructure and no-fake-estimate behavior.
- Live tests are isolated behind `LIVE_TEST=1` because CI/container environments may not have outbound DNS/network access.

Run:

```bash
npm run check
npm test
LIVE_TEST=1 npm run test:live
```

## Capability classes

### Operational with public/official source
CNPJ bootstrap, PNCP, TCU, Querido Diario, GLEIF, HTTP/DNS/RDAP, Wayback, GDELT, Crossref, Open-Meteo, Reddit public JSON, YouTube oEmbed, BCB, SEC, Coinbase, IBGE SIDRA, RIPEstat, PeeringDB and certificate transparency.

### Operational when internal/self-hosted dependency is configured
Judiciario BR, SearXNG web/SERP/social/ad search, Nominatim and YouTube transcript service.

### Operational after local dataset ingestion/calibration
INPI mirror, regulatory mirrors, ComexStat/RAIS-CAGED mirrors, local backlink graph and traffic estimation model.

## Intentional non-claims

The project does not claim exact third-party website traffic, proprietary Similarweb audience overlap, Ahrefs-scale global backlinks, Apollo-scale people data, or unrestricted private social-network data. Where those datasets do not exist locally, tools report that fact instead of fabricating precision.
