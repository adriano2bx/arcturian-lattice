---
name: sales-discovery-prep
description: Prepares an evidence-based discovery brief for a B2B sales conversation from public account and market signals without inventing stakeholders or pain.
license: Proprietary - internal use
compatibility: Requires an Agent Skills client and the DeltaBots Arcturian / Lattice MCP.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  contract-version: "2.0"
  skill-version: "1.0.0"
  segment: "sales"
  workflow: "discovery-preparation"
  status: "active"
  mcp-server: "arcturian-lattice"
---
# Sales Discovery Preparation

## Objective

Create a concise, source-linked briefing that helps a seller conduct a useful
discovery conversation: verified context, hypotheses to test, questions and
unknowns. It must not impersonate research about a person.

## When to use / When not to use

Use before a first or strategic discovery meeting when an account and business
question are known. Do not use to fabricate stakeholder maps, personal profiles,
budget, urgency or internal pain.

## Inputs

- `account` and optional CNPJ/domain (required)
- `offer` (required): product or capability being considered
- `meetingGoal` (required): decision the meeting should advance
- `knownContext` (optional): facts supplied by the seller, marked as unverified

## Preconditions

Validate the account identity and separate seller-provided context from public
observations. Define what would count as evidence that the offer is relevant.

## Workflow

1. Resolve identity with `company.profile` or `company.osint`.
2. Inspect the official domain with `web.profile` and `web.technology`.
3. Review `web.sitemap` for product, hiring, documentation or expansion signals.
4. Search `news.search` for dated strategic changes relevant to the offer.
5. Use `company.public_contracts` or `regulatory.search` only when the sector
   makes public procurement or regulation material to the meeting.
6. Compare `competitive.snapshot` only if the seller supplied a defined
   competitor set or a specific comparison question.
7. Convert observations into three sections: verified context, hypotheses to
   test and questions that can falsify each hypothesis.

## Evidence and validation

Every context statement receives an evidence ID, source, observed date and level
(A/B/C/D). A hypothesis must cite the observations that motivated it and state
what answer would disconfirm it. Names of employees or decision makers are
included only when explicitly provided and authorized by the user.

## Decision rules

- Prefer questions that test business impact, current process, constraints,
  stakeholders and success criteria.
- Do not claim that a website feature proves an internal priority.
- Do not rank a stakeholder by job title alone.
- If evidence is thin, produce a discovery agenda rather than a qualification
  verdict.

## Output contract

Return the standard contract fields plus:

- `meetingBrief`: objective, agenda and time allocation;
- `verifiedContext[]`: statement, evidence IDs and freshness;
- `hypotheses[]`: hypothesis, rationale, confidence and falsifier;
- `questions[]`: question, purpose and evidence gap;
- `unknowns[]`: unresolved information to collect in the meeting;
- `prohibitedAssumptions[]`: likely but unsupported claims explicitly rejected.

## Failure handling

Preserve partial observations and label unavailable providers. Never fill an
unknown with an industry average or generic buyer persona.

## Privacy and safety

The output is preparation material, not a communication sent to the account.
Do not create CRM activities, contact people or send outreach automatically.

## Tool mapping

`company.profile`, `company.osint`, `web.profile`, `web.technology`,
`web.sitemap`, `news.search`, `company.public_contracts`, `regulatory.search`,
`competitive.snapshot`

## Examples and tests

- Official domain and recent expansion news: hypotheses linked to both sources.
- No reliable identity match: `blocked` until the account is resolved.
- No recent signals: questions focus on current process, not invented triggers.
