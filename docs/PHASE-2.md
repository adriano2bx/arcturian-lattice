# Phase 2 — Legal, Intellectual Property and Web Profile

## `company.legal`

Primary route: the existing internal **Judiciario BR MCP** using `buscar_por_parte` over DJEN public data.

Environment variables:

- `JUDICIARIO_MCP_URL` — for example the internal DEV/operational MCP base URL.
- `JUDICIARIO_BEARER_TOKEN` — Bearer token/API key authorized for the legal MCP.

The tool accepts CNPJ and optionally `legalName`. For legacy numeric CNPJ it can resolve the legal name through `company.profile`; for identifiers unsupported by the profile provider, pass `legalName` explicitly.

Important: legal results are signals/public records and **not legal conclusions**.

## `company.ip`

The current implementation deliberately uses a **local D1 mirror of INPI data** instead of a paid third-party API or fragile scraping dependency.

Schema: `migrations/0001_ip_assets.sql`.

The INPI Portal roadmap for 2026 includes JSON/XML API access in Portal version 3; until a stable public developer contract is available, the local mirror is the production-safe path. Importers can ingest official exports/API payloads into `ip_assets` without changing the MCP tool contract.

## `web.profile`

Sources:

- direct HTTP(S) observation of the public site;
- DNS over HTTPS (Cloudflare public resolver);
- RDAP discovered through the official IANA RDAP bootstrap registry.

This tool supports partial success: failure of DNS, RDAP or the website does not erase successful observations from the other sources.

## Cloudflare D1 setup for IP data

Create the database once:

```bash
npx wrangler d1 create arcturian-lattice
```

Add the returned binding to `wrangler.jsonc` as `DB`, then apply:

```bash
npx wrangler d1 migrations apply arcturian-lattice --remote
```

No commercial API key is required for `company.ip`; the data-loading job is separate from the query path.
