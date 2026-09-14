---
name: website-intelligence
description: Builds a public intelligence profile of a website or domain using HTTP, DNS, RDAP, sitemap, technology detection and subdomain signals. Use for competitor research, prospect enrichment, vendor review or digital reconnaissance.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "web-intelligence"
  mcp-server: "arcturian-lattice"
---
# Website Intelligence

1. Run `web.profile` for HTTP, DNS and RDAP.
2. Run `web.technology` and `web.sitemap`.
3. Run `osint.subdomains` for passive certificate-transparency discovery.
4. If public IP/ASN data is relevant, use `infra.network` and `infra.peering`.
5. Build a concise digital-asset map: root domain, nameservers, mail, hosting/CDN clues, technologies, sitemap coverage and passive subdomains.

Use only passive/low-impact reconnaissance for third-party assets. Do not turn this workflow into vulnerability scanning.

## Arcturian Lattice MCP tools used
`web.profile`, `web.technology`, `web.sitemap`, `osint.subdomains`, `infra.network`, `infra.peering`

