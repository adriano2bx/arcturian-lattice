---
name: continuous-intelligence-monitoring
description: Creates and manages recurring intelligence monitors that persist snapshots and change events. Use when a company, competitor or website should be watched continuously for meaningful changes.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "automation"
  mcp-server: "nexus-intelligence-mcp"
---
# Continuous Intelligence Monitoring

1. Choose `web_profile` for website-level change tracking or `competitive_snapshot` for broader competitive signals.
2. Create a monitor with `monitor.create`; use a cadence proportionate to how fast the target changes.
3. Run once with `monitor.run` to establish a baseline.
4. Review `monitor.events` for detected changes.
5. Use `monitor.run_due` for testing; scheduled execution should normally be handled by Cloudflare Cron.

Do not alert on every hash change. A downstream agent should classify materiality before notifying humans.

## Nexus MCP tools used
`monitor.create`, `monitor.list`, `monitor.run`, `monitor.events`, `monitor.run_due`

