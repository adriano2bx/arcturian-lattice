---
name: sector-market-sizing
description: Frames Brazilian sector market size from selected official IBGE indicators without presenting proxies as revenue forecasts.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "market"
  workflow: "sector-market-sizing"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Sector Market Sizing

## Objective
Construct a transparent market-sizing frame from official sector indicators and declared assumptions.
## When to use / When not to use
Use for planning and hypothesis formation. Do not call an indicator TAM/SAM/SOM without defining the proxy.
## Inputs
`sector`, `variables[]`, `territories[]`, `periods`, optional `assumptions[]` and `question`.
## Preconditions
Select IBGE variables and units before calculating; distinguish stock, flow and index.
## Workflow
1. Call `market.ibge` with explicit sector, territories and periods.
2. Normalize units and missing observations.
3. Apply only declared, reproducible assumptions and show sensitivity ranges.
4. Compare segments and territories on compatible periods.
5. Return observed indicators separately from the modeled market frame.
## Evidence and validation
IBGE data are level A; calculations and assumptions are level C/D and must be labeled.
## Decision rules
Use `supported_proxy`, `insufficient_data` or `scenario_only`; never fabricate market volume.
## Output contract
Return `question`, `observations[]`, `assumptions[]`, `scenarios[]`, `limitations[]`, `evidence[]` and `confidence`.
## Failure handling
Expose unavailable variables and retain raw successful data; do not impute silently.
## Privacy and safety
Use aggregate public statistics only.
## Tool mapping
`market.ibge`
## Examples and tests
Test one sector, multiple territories, unit mismatch and missing period.
