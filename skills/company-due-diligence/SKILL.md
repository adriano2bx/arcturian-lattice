---
name: company-due-diligence
description: Builds an evidence-graded due diligence dossier for a Brazilian company using official registrations, public contracts, legal signals, IP, web presence and OSINT. Use when evaluating a client, supplier, partner, acquisition target or high-value prospect.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the Nexus Intelligence MCP configured.
metadata:
  author: "Nexus Intelligence"
  version: "1.0.0"
  category: "company-intelligence"
  mcp-server: "nexus-intelligence-mcp"
---
# Company Due Diligence

## Goal
Produce a defensible company dossier without treating estimates or search results as authoritative facts.

## Workflow
1. If a CNPJ is provided, call `company.validate_cnpj`. Stop and ask for correction if invalid.
2. Call `company.profile` for identity and registration details.
3. Call `company.risk`; report each certificate/source separately and never infer guilt, fraud, insolvency or legal liability from a hit alone.
4. Call `company.public_contracts` when public-sector exposure matters. Use both supplier and organization roles when relevant.
5. Call `company.legal` for public judicial publication signals. Treat these as leads requiring contextual review, not legal conclusions.
6. Call `company.ip` and `company.gazette` for intellectual-property and municipal-gazette signals.
7. Call `company.osint` for a consolidated public-source view.
8. If a domain is known, enrich with `web.profile`, `web.technology`, `web.history`, and `news.search`.

## Evidence grading
- **A — authoritative:** official registry, regulator, court/public procurement source.
- **B — observed:** directly observed website/DNS/page content.
- **C — derived:** score or conclusion computed from A/B evidence.
- **D — estimated:** model-based estimate. Always label it.

## Output
Return: identity, ownership/relationships if available, public-sector exposure, legal/publication signals, IP, digital presence, notable historical changes, risks requiring human review, opportunities, sources, freshness and confidence.

## Guardrails
Do not expose personal data that is not necessary for the business purpose. Do not turn public records into accusations. Distinguish absence of evidence from evidence of absence.

## Nexus MCP tools used
`company.validate_cnpj`, `company.profile`, `company.risk`, `company.public_contracts`, `company.legal`, `company.ip`, `company.gazette`, `company.osint`, `web.profile`, `web.history`, `web.technology`, `news.search`

