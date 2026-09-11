---
name: legal-risk-screening
description: Screens a Brazilian company using public integrity certificates and judicial publication signals without making legal conclusions. Use for vendor onboarding, partnership checks, compliance triage or legal-risk reconnaissance.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "risk"
  mcp-server: "nexus-intelligence-mcp"
---
# Legal and Public-Integrity Screening

1. Validate identity with `company.profile`.
2. Call `company.risk` and preserve the source-level result.
3. Call `company.legal` with a bounded date interval and, where useful, a tribunal filter.
4. Summarize only observable facts: publication existence, court/source, date and subject clues.
5. Separate **screening hit** from **confirmed adverse finding**.

Never infer guilt, conviction, fraud, insolvency or wrongdoing from a name match, publication count or certificate metadata alone. Recommend human/legal review for material findings.

## Nexus MCP tools used
`company.risk`, `company.legal`, `company.profile`

