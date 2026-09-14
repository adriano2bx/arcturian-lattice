# Deploy on Cloudflare

## 1. Install

```bash
npm install
npm test
```

## 2. Create D1

```bash
npx wrangler d1 create arcturian-lattice
```

Copy the returned database ID into a `d1_databases` binding named `DB` in `wrangler.jsonc`.

## 3. Apply migrations

```bash
npx wrangler d1 migrations apply arcturian-lattice --remote
```

## 4. Secrets

Required for private production use:

```bash
npx wrangler secret put MCP_TOKEN
```

Optional:

```bash
npx wrangler secret put JUDICIARIO_MCP_URL
npx wrangler secret put JUDICIARIO_BEARER_TOKEN
npx wrangler secret put OPENALEX_API_KEY
npx wrangler secret put RESEARCH_CONTACT_EMAIL
npx wrangler secret put SEC_USER_AGENT
npx wrangler secret put SEARXNG_URL
npx wrangler secret put NOMINATIM_URL
npx wrangler secret put YOUTUBE_TRANSCRIPT_URL
```

`ALLOW_KOME_FALLBACK` should remain false unless you intentionally want the undocumented external Kome endpoint to be used as fallback.

## 5. Deploy

```bash
npx wrangler deploy
```

The MCP endpoint is:

```text
https://<worker>.<account>.workers.dev/mcp
```

Header:

```text
Authorization: Bearer <MCP_TOKEN>
```

## 6. Cron

`wrangler.jsonc` includes a 30-minute Cron trigger. `scheduled()` executes a small batch of due D1 monitors. Each monitor still controls its own logical interval.

## 7. Sidecars

Keep the public-facing MCP as one Worker. Heavy engines should run elsewhere (for example the existing VPS/Easypanel) and be consumed privately:

- SearXNG
- Nominatim
- YouTube transcript stack (youtubei/yt-dlp/faster-whisper)
- later: Crawl4AI/Playwright, large Common Crawl processing, ClickHouse/OpenSearch

This preserves a single MCP endpoint for Hermes while avoiding impossible workloads inside a Worker isolate.
