# DeltaBots Arcturian / Lattice MCP

Private intelligence capability layer for Hermes/AI agents. The Worker is the single MCP facade; public/official sources, local D1 mirrors and optional self-hosted engines sit behind it.

## v1.0 capability surface

The server exposes **45 high-level MCP tools** across:

- Company intelligence: CNPJ, PNCP, TCU, Judiciario BR, INPI mirror, Querido Diario, GLEIF and consolidated OSINT.
- Web intelligence: HTTP/DNS/RDAP profile, Wayback history, technology fingerprinting, sitemap and self-hosted search.
- SEO: on-page audit, SERP via SearXNG and local backlink graph.
- Research/news: OpenAlex, Crossref, GDELT and multi-source deep research.
- Market: IBGE SIDRA, Open-Meteo, crypto rates and local market-data mirrors.
- Social/content: YouTube metadata/transcript, Reddit, public social mentions and ad-transparency discovery.
- Finance: Banco Central SGS and SEC EDGAR.
- Infrastructure/OSINT: certificate transparency, RIPEstat and PeeringDB.
- Regulatory mirrors: CVM, ANS, ANVISA, Anatel, ANEEL, ANP and SUSEP.
- Competitive intelligence: snapshots, domain comparison and calibrated-only traffic estimates.
- Continuous intelligence: D1 monitors, snapshots, change events and Cloudflare Cron execution.

## Reliability rule

Every tool is explicit about its evidence class. Official/public API data is never presented as equivalent to an inferred estimate. `competitive.traffic_estimate` intentionally refuses to invent traffic numbers until a calibrated local model exists.

## Runtime architecture

```text
Hermes / agents
      |
      v
Cloudflare Worker /mcp
      |
      +-- official/open public APIs
      +-- Judiciario BR MCP
      +-- D1 local mirrors + history
      +-- optional SearXNG / Nominatim / transcript sidecars
```

The Worker itself contains no paid API dependency.

## Quick start

```bash
npm install
npm test
npx wrangler login
```

Create D1, add the `DB` binding in `wrangler.jsonc`, then apply migrations:

```bash
npx wrangler d1 create arcturian-lattice
npx wrangler d1 migrations apply arcturian-lattice --remote
```

Set an internal bearer token:

```bash
npx wrangler secret put MCP_TOKEN
```

Optional integrations:

```text
JUDICIARIO_MCP_URL
JUDICIARIO_BEARER_TOKEN
SEARXNG_URL
NOMINATIM_URL
YOUTUBE_TRANSCRIPT_URL
ALLOW_KOME_FALLBACK=false
OPENALEX_API_KEY
RESEARCH_CONTACT_EMAIL
SEC_USER_AGENT
```

Deploy:

```bash
npm run deploy
```

## What is truly Worker-only?

The MCP facade, public-source connectors, D1 persistence, Cron monitors and lightweight parsing all run on Workers. Heavy open-source services such as SearXNG, Nominatim, Whisper/yt-dlp, Crawl4AI/Playwright, SpiderFoot and large search indexes **cannot realistically be hosted inside a Workers Free isolate**. Their adapters are included so they can live on an internal VPS/Easypanel while Hermes still sees one MCP endpoint.

See `docs/V1-STATUS.md`, `docs/PROVIDER-MATRIX.md` and `docs/DEPLOY-CLOUDFLARE.md`.

## Agent Skills (v1.1)

The repository now includes **28 integrated Agent Skills** under `skills/`. They encode multi-tool workflows for Hermes: company due diligence, ABM, competitive intelligence, SEO, social listening, YouTube, market research, regulatory intelligence, continuous monitoring and more.

```bash
npm run skills:validate
npm run skills:install -- --target hermes
```

See [`docs/SKILLS.md`](docs/SKILLS.md) and [`skills/manifest.json`](skills/manifest.json).

