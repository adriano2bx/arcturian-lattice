---
name: sales-account-qualification
description: Qualifies a B2B account for sales prioritization using public identity, digital, market and change evidence; never infers purchase intent.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "sales"
  workflow: "qualification"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Sales Account Qualification

## Objective

Produce an evidence-graded qualification brief that helps a seller decide
whether to prioritize an account, what to investigate next and which hypothesis
to test in discovery. This is not a prediction of buying intent.

## When to use / When not to use

Use before strategic outbound, account planning or opportunity review. Do not
use to infer private budgets, personal attributes, employee sentiment or an
individual's authority without explicit evidence.

## Inputs

- `account`: legal name, trade name or CNPJ (at least one required)
- `domain` (optional): official domain to enrich digital signals
- `sector` and `territory` (optional): context for comparison
- `question` (optional): the commercial decision to support

## Preconditions

1. Resolve the account to a single legal identity. If multiple entities match,
   stop and return `partial` with the ambiguity.
2. Do not reuse a previous dossier without checking its observation dates.
3. Define the qualification dimensions before collecting evidence: fit,
   relevance, change, access path and risk.

## Workflow

1. Call `company.validate_cnpj` when a CNPJ is supplied; stop on invalid input.
2. Call `company.profile` and record legal name, status, activities and location.
3. Call `company.osint` to collect a consolidated public-source baseline.
4. If a domain is known, call `web.profile`, `web.technology` and
   `web.sitemap` to observe digital presence and product/market signals.
5. Call `news.search` for recent events using the legal/trade name plus sector;
   retain the publication date and source for every item.
6. Call `competitive.snapshot` only when a comparison set or market question
   was supplied. Never turn a missing comparison into a negative score.
7. Reconcile names, CNPJ, domains, dates and locations across all results.
8. Build a qualification matrix with one row per criterion and one evidence
   reference per assertion.

## Evidence and validation

- A: official registration, regulator, procurement or court/public source.
- B: direct website, DNS, HTTP, sitemap or dated public news observation.
- C: reproducible fit/priority derivation from A/B.
- D: model estimate; do not use unless explicitly requested and calibrated.

An account is not “qualified” because it appears in search results. Mark each
criterion `observed`, `derived`, `unknown` or `conflicted`.

## Decision rules

- Recommend `prioritize`, `investigate` or `deprioritize` only from observable
  fit and triggers; include the evidence and confidence.
- A recent change is a conversation hypothesis, not proof of a buying project.
- A risk signal changes the recommended diligence step; it does not prove guilt.
- If identity or freshness is unresolved, cap overall confidence at `low`.

## Output contract

Return the standard contract fields plus:

- `subject`: resolved identity and identifiers;
- `qualification`: `prioritize|investigate|deprioritize`;
- `criteria[]`: criterion, value, evidence IDs and confidence;
- `triggers[]`: dated observable changes and suggested discovery questions;
- `hypotheses[]`: testable value hypotheses, explicitly labeled;
- `nextActions[]`: research or seller actions, with no automatic execution.

## Failure handling

Return `partial` when a provider fails, preserve successful evidence and list the
missing source in `gaps`. Retry transient reads once at most. Never substitute a
provider failure with a zero score.

## Privacy and safety

Use only data necessary for the account decision. Do not expose personal data,
guess email addresses or generate unsolicited messages. The agent, not this
skill or the MCP, decides whether and when to update CRM records.

## Tool mapping

`company.validate_cnpj`, `company.profile`, `company.osint`, `web.profile`,
`web.technology`, `web.sitemap`, `news.search`, `competitive.snapshot`

## Examples and tests

- Known CNPJ + official domain: complete dossier with dated evidence.
- Name matches two entities: `partial`, ambiguity listed, no prioritization.
- News provider unavailable: successful company facts retained, news gap shown.
