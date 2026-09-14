---
name: availability-infrastructure-diagnosis
description: Diagnoses observable public availability and origin signals for a domain without active security scanning.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "web-intelligence"
  workflow: "availability-diagnosis"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Availability and Infrastructure Diagnosis

## Objective
Explain observed HTTP, DNS and public network availability signals for a domain.
## When to use / When not to use
Use for integration planning and incident context. Do not scan ports, bypass controls or claim uptime from one observation.
## Inputs
`domain`, optional `paths[]`, `regions[]`, `includeNetwork` and `observedAt`.
## Preconditions
Normalize the domain and authorize only passive public requests.
## Workflow
1. Call `web.profile` for HTTP, redirects, DNS and TLS observations.
2. Call `infra.network` for public IP/ASN context only when resolved.
3. Reconcile response status, latency, host, IP and timestamp.
4. Classify `available`, `degraded`, `unreachable` or `inconclusive`.
## Evidence and validation
Each probe is a level B observation; classification is level C and time-bound.
## Decision rules
One failed probe is insufficient for an outage claim; expose region/provider limitations.
## Output contract
Return `domain`, `probes[]`, `network`, `classification`, `gaps[]`, `evidence[]` and `confidence`.
## Failure handling
Return partial observations and no synthetic uptime percentage.
## Privacy and safety
Passive requests only; never test credentials, vulnerabilities or private addresses.
## Tool mapping
`web.profile`, `infra.network`
## Examples and tests
Test healthy response, redirect, DNS-only host, timeout and provider disagreement.
