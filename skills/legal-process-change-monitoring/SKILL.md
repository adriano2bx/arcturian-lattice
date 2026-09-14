---
name: legal-process-change-monitoring
description: Tracks observable changes in a public legal publication baseline and returns dated events for attorney review.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "legal"
  workflow: "process-change-monitoring"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Legal Process Change Monitoring

## Objective
Detect changes against a saved public-publication baseline; do not infer deadlines or outcomes.
## When to use / When not to use
Use after an attorney defines a monitored query. Do not create schedules or notifications in the MCP.
## Inputs
`monitorId` or a publication query, `baseline`, optional `dateFrom`, `dateTo` and `tribunal`.
## Preconditions
Require a stable query identity and record baseline timestamp and provider coverage.
## Workflow
1. Use `monitor.create` only when the agent explicitly requests persistence.
2. Use `monitor.run` to capture a new snapshot of the selected public query.
3. Use `monitor.events` to list additions, removals and changed fields.
4. Validate material events with `company.legal` or `legal.publications_by_oab`.
5. Return an attorney review queue; the agent chooses cadence and escalation.
## Evidence and validation
Events are differences between dated observations (level C) backed by public records (A/B).
## Decision rules
Classify `new`, `changed`, `removed` or `unconfirmed`; never classify legal significance automatically.
## Output contract
Return `query`, `baselineAt`, `currentAt`, `events[]`, `coverage`, `gaps[]`, `evidence[]` and `confidence`.
## Failure handling
Keep the previous baseline when a run is incomplete and mark the event set inconclusive.
## Privacy and safety
Restrict access to authorized legal teams and minimize personal data.
## Tool mapping
`monitor.create`, `monitor.run`, `monitor.events`, `company.legal`, `legal.publications_by_oab`
## Examples and tests
Test first baseline, changed publication, incomplete provider and duplicate event.
