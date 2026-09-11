---
name: website-intelligence
description: Builds a public intelligence profile of a website or domain using HTTP, DNS, RDAP, sitemap, technology detection and subdomain signals. Use for competitor research, prospect enrichment, vendor review or digital reconnaissance.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "web-intelligence"
  mcp-server: "nexus-intelligence-mcp"
---
# Website Intelligence

1. Run `web.profile` for HTTP, DNS and RDAP.
2. Run `web.technology` and `web.sitemap`.
3. Run `osint.subdomains` for passive certificate-transparency discovery.
4. If public IP/ASN data is relevant, use `infra.network` and `infra.peering`.
5. Build a concise digital-asset map: root domain, nameservers, mail, hosting/CDN clues, technologies, sitemap coverage and passive subdomains.

Use only passive/low-impact reconnaissance for third-party assets. Do not turn this workflow into vulnerability scanning.

## Nexus MCP tools used
`web.profile`, `web.technology`, `web.sitemap`, `osint.subdomains`, `infra.network`, `infra.peering`

