---
name: bcb-series-reading
description: Reads official Banco Central SGS time series with units, periods, transformations and uncertainty explicitly preserved.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "finance"
  workflow: "bcb-series-reading"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# BCB Series Reading

## Objective
Answer a defined macro/financial question from official BCB SGS series without mislabeling units or frequency.

## When to use / When not to use
Use for economic context and executive analysis. Do not provide investment advice or
claim a series is real-time when its publication has a lag.

## Inputs
`series[]`, `dateFrom`, `dateTo`, optional `frequency`, `transform` and `question`.

## Preconditions
Confirm series codes, units, frequency and date format before comparison.

## Workflow
1. Call `finance.bcb_series` for each explicitly identified series.
2. Normalize dates, missing values and units; retain raw observations.
3. Apply only declared transformations such as change, average or index base.
4. Compare aligned periods and identify revisions, breaks or insufficient coverage.
5. Separate observed values, derived statistics and interpretation in the answer.

## Evidence and validation
BCB observations are level A; transformations are level C. Every value must include
series code, unit, period and source metadata.

## Decision rules
Do not compare incompatible units or frequencies. If the question is underspecified,
return `needs_parameters` instead of selecting a series by guess.

## Output contract
Return `question`, `series[]`, `observations[]`, `transformations[]`, `findings[]`,
`limitations[]`, `evidence[]` and `confidence`.

## Failure handling
Return successful series with failed series listed in `gaps`; retry transient reads once.

## Privacy and safety
Use aggregate public economic data; no personalized financial recommendation.

## Tool mapping
`finance.bcb_series`

## Examples and tests
Test aligned inflation/rate series, missing periods, incompatible frequencies and invalid codes.
