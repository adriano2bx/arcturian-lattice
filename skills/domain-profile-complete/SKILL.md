---
name: domain-profile-complete
description: Builds a complete public technical profile of a domain by reconciling HTTP, DNS, RDAP, sitemap, technology and certificate signals.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "web-intelligence"
  workflow: "complete-domain-profile"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Complete Domain Profile

## Objective
Describe observable digital assets and technical posture without performing security testing.

## When to use / When not to use
Use for due diligence, integration planning or public asset mapping. Do not scan
private ranges, exploit services or treat technology fingerprints as vulnerabilities.

## Inputs
`domain` and optional `includeHistory`, `includeSubdomains`, `includeNetwork`.

## Preconditions
Normalize the registrable domain, define observation time and authorize only public assets.

## Workflow
1. Call `web.profile` for HTTP, metadata and DNS baseline.
2. Call `web.technology` to classify observable stack signatures.
3. Call `web.sitemap` to inventory declared public URLs.
4. Call `osint.subdomains` and `infra.network` only for passive public signals.
5. Reconcile hostnames, certificates, redirects and dates; label each observation.

## Evidence and validation
Direct HTTP/DNS/RDAP/certificate observations are level B. Fingerprint-derived
technology is level C and must retain the matched signature.

## Decision rules
Do not infer ownership from a subdomain alone. Report missing DNS, blocked HTTP or
empty sitemap as coverage gaps, not as evidence of absence.

## Output contract
Return `domain`, `hosts[]`, `http`, `dns`, `rdap`, `technologies[]`, `sitemap`,
`subdomains[]`, `network`, `evidence[]`, `gaps[]` and `confidence`.

## Failure handling
Return partial sections independently; retry transient reads once and preserve timestamps.

## Privacy and safety
Only passive public observations are allowed. No port scanning, credential testing or targeting.

## Tool mapping
`web.profile`, `web.technology`, `web.sitemap`, `osint.subdomains`, `infra.network`

## Examples and tests
Test a healthy site, redirect chain, DNS-only domain and provider timeout.
