---
name: territory-economic-profile
description: Builds an evidence-based Brazilian territory profile from official IBGE indicators and public geographic context.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "market"
  workflow: "territory-profile"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Territory Economic Profile

## Objective
Describe a Brazilian municipality/state using explicitly selected official indicators.
## When to use / When not to use
Use for expansion and territory comparison. Do not infer demand, revenue or market share directly from population indicators.
## Inputs
`territories[]`, `variables[]`, optional `periods`, `question` and `comparisonBasis`.
## Preconditions
Normalize territory names/codes and select comparable variables and periods.
## Workflow
1. Call `market.ibge` with explicit territories, variables and periods.
2. Use `geo.search` only to resolve geographic identifiers or context.
3. Normalize units, frequency, missing values and revisions.
4. Compare only like-for-like territories and state derived calculations.
## Evidence and validation
IBGE observations are level A; comparisons are level C. Preserve codes and units.
## Decision rules
Return `supported`, `partial` or `needs-parameters`; no causal or forecast claim without a model.
## Output contract
Return `territories[]`, `indicators[]`, `comparisons[]`, `limitations[]`, `evidence[]` and `confidence`.
## Failure handling
Keep successful territories and list unavailable indicators; never impute silently.
## Privacy and safety
Use aggregate public data only.
## Tool mapping
`market.ibge`, `geo.search`
## Examples and tests
Test two states, missing period, unit mismatch and invalid territory code.
