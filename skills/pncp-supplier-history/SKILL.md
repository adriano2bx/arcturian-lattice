---
name: pncp-supplier-history
description: Reconstructs a Brazilian supplier's public procurement history with bounded pagination, role filters and completeness reporting.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "public-procurement"
  workflow: "supplier-history"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# PNCP Supplier History

## Objective
Summarize observed PNCP contracts for a supplier during an explicit period.

## When to use / When not to use
Use for public-sector sales and supplier diligence. Do not call the result a complete
lifetime history unless the provider reports complete coverage for the requested window.

## Inputs
`cnpj`, `dateFrom`, `dateTo`, optional `maxPages` and `includeCancelled`.

## Preconditions
Validate CNPJ, require bounded ISO dates and record the query's page cap.

## Workflow
1. Call `company.public_contracts` with `role=supplier`.
2. Deduplicate by contract/procurement identifier and normalize dates and values.
3. Group by contracting body, modality, status and period.
4. Verify supplier identity in every returned record; flag mismatches.
5. Report concentration, observed totals and coverage metadata without extrapolation.

## Evidence and validation
PNCP records are level A public observations; aggregation is level C. Preserve source
links, query parameters and whether pagination reached the requested boundary.

## Decision rules
`complete` requires provider completeness; otherwise return `partial`. Never interpret
contract value as revenue or infer future awards.

## Output contract
Return `supplier`, `contracts[]`, `aggregates`, `coverage`, `evidence[]`, `gaps[]` and `confidence`.

## Failure handling
Return collected pages plus a continuation gap on timeout; do not turn an empty page into no history.

## Privacy and safety
Use public procurement data and avoid personal profiling of representatives.

## Tool mapping
`company.validate_cnpj`, `company.public_contracts`

## Examples and tests
Test complete pagination, capped pagination, cancelled records and mismatched supplier IDs.
