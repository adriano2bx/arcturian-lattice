---
name: network-infrastructure-osint
description: Maps public network, ASN, DNS and peering signals for a company domain using passive or registry-based sources. Use for infrastructure intelligence, vendor research or digital-asset mapping—not unauthorized security testing.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "osint"
  mcp-server: "nexus-intelligence-mcp"
---
# Network Infrastructure OSINT

1. Begin with `web.profile` and passive `osint.subdomains`.
2. For public IP/ASN resources, use `infra.network`.
3. Use `infra.peering` for registry/peering context.
4. Create an asset map with evidence source and timestamp.

Only passive/registry reconnaissance is authorized by this skill. Do not perform port scanning, vulnerability scanning, credential attacks or exploitation against third-party systems.

## Nexus MCP tools used
`web.profile`, `osint.subdomains`, `infra.network`, `infra.peering`

