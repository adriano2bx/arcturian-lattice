---
name: partner-financial-screening
description: Screens a business partner using public registration, regulatory and macro-financial evidence without issuing a credit decision.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "finance"
  workflow: "partner-financial-screening"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Partner Financial Screening

## Objective
Organize public financial and registration signals for human commercial review.
## When to use / When not to use
Use before partnership or supplier review. Do not infer solvency, default probability or private financials.
## Inputs
`cnpj`, `legalName`, optional `series[]`, `dateFrom`, `dateTo` and `regulatorySources[]`.
## Preconditions
Resolve the entity and define the decision horizon and evidence threshold.
## Workflow
1. Validate and profile the company with `company.validate_cnpj` and `company.profile`.
2. Query `regulatory.search` for relevant public regulator records.
3. Use `finance.bcb_series` only for macro context relevant to the sector or contract.
4. Reconcile dates, entities and source freshness; separate facts from risk hypotheses.
5. Return review questions and missing evidence, not an automated approval.
## Evidence and validation
Official records are level A; derived screening flags are level C. A missing record is unknown.
## Decision rules
Return `review`, `insufficient-evidence` or `no-adverse-public-observation`; never “safe”.
## Output contract
Return `entity`, `registration`, `regulatoryRecords[]`, `macroContext[]`, `flags[]`, `gaps[]`, `evidence[]` and `confidence`.
## Failure handling
Preserve successful sections and mark provider outages; retry transient reads once.
## Privacy and safety
Use public business data and avoid consumer credit profiling.
## Tool mapping
`company.validate_cnpj`, `company.profile`, `regulatory.search`, `finance.bcb_series`
## Examples and tests
Test valid partner, regulatory hit, macro-only context and missing CNPJ.
