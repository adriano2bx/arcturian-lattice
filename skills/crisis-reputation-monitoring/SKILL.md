---
name: crisis-reputation-monitoring
description: Monitors public news and social signals for a company or brand, grouping potential reputation issues and validating material events. Use for crisis detection, reputation monitoring or competitor-incident tracking.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "risk"
  mcp-server: "nexus-intelligence-mcp"
---
# Crisis and Reputation Monitoring

1. Search the brand and key products with `news.search` and `social.search_mentions`; use `reddit.search` for direct Reddit evidence.
2. Cluster issues by topic, source and recency.
3. Validate material claims with `web.search` and multiple sources.
4. Create a monitor when ongoing observation is justified.
5. Escalate only when evidence suggests a meaningful change in volume, severity or source credibility.

Avoid automated accusations, doxxing, personal targeting or overconfident sentiment claims.

## Nexus MCP tools used
`news.search`, `social.search_mentions`, `reddit.search`, `monitor.create`, `monitor.events`, `web.search`

