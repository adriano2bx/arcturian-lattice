---
name: website-change-forensics
description: Reconstructs how a website, offer or positioning changed over time using Wayback snapshots and current public observations. Use for competitor-history research, pricing/offer forensics or campaign retrospectives.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "web-intelligence"
  mcp-server: "nexus-intelligence-mcp"
---
# Website Change Forensics

1. Use `web.history` to identify snapshots around relevant dates.
2. Compare snapshot timing with the current `web.profile` and `web.sitemap`.
3. Use `news.search` to correlate public events with observed web changes.
4. Report only changes supported by archived/current evidence.

Focus on: positioning, product names, pricing claims, CTA, landing pages, navigation, geographic expansion and major content launches.

## Nexus MCP tools used
`web.history`, `web.profile`, `web.sitemap`, `news.search`

