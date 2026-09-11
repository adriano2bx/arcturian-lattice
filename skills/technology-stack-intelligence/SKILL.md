---
name: technology-stack-intelligence
description: Identifies and interprets a company website technology stack from public HTML, headers, DNS and infrastructure signals. Use for martech research, vendor displacement opportunities, integration planning or competitor tech benchmarking.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "web-intelligence"
  mcp-server: "nexus-intelligence-mcp"
---
# Technology Stack Intelligence

1. Call `web.technology` and `web.profile`.
2. Use `osint.subdomains` to find public app/portal/checkout surfaces when relevant.
3. Use `infra.network` only for public infrastructure context.
4. Classify findings into CMS/framework, analytics, advertising, CRM/marketing, chat/support, CDN/security, hosting and commerce.
5. Distinguish detected technology from inferred architecture.

For sales use cases, turn stack findings into plausible integration/displacement opportunities, clearly labeling inference.

## Nexus MCP tools used
`web.technology`, `web.profile`, `osint.subdomains`, `infra.network`

