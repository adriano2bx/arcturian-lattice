# DeltaBots Arcturian / Lattice Agent Skills

Version 1.1 adds an internal Agent Skills catalog inspired by the workflow layer used by AIsa, but bound to the private DeltaBots Arcturian / Lattice MCP rather than paid third-party APIs.

## Architecture

```text
Hermes
  ├── skill discovery / progressive loading
  │      └── ~/.hermes/skills/<skill>/SKILL.md
  │
  └── DeltaBots Arcturian / Lattice MCP
         └── stable high-level tools
```

The skills do not duplicate provider logic. They teach the agent **when and how to combine MCP tools**, how to grade evidence, and what not to infer.

## Workflow registry

The business catalog is machine-readable in `skills/workflows.json`. It contains
one record per workflow candidate with a stable ID, segment, lifecycle status,
linked skill packages, derived MCP tools and a `routable` flag. The registry is
generated from `docs/SKILL-CATALOG-ROADMAP.md`; it does not turn every roadmap
item into a skill automatically.

Each record also exposes `implementation.state` (`routable`, `blocked` or
`not_started`) and a deterministic `implementation.blockers` list. This keeps
the console and agent from treating a planned or provider-dependent workflow as
available.

```bash
npm run workflows:generate
npm run workflows:validate
npm run workflows:list
```

Only workflows with status `active` and active skill dependencies are routable.
The agent remains responsible for choosing order, parameters, frequency,
validation and the final decision output.

## Install

```bash
npm run skills:validate
npm run skills:install -- --target hermes
```

Use `--force` to update existing Nexus skills:

```bash
npm run skills:install -- --target hermes --force
```

The installer honors `HERMES_HOME`; otherwise it writes to `~/.hermes/skills/`.

## Categories

- company intelligence / OSINT
- risk and legal screening
- public procurement / go-to-market / ABM
- web and technology intelligence
- SEO and backlink intelligence
- research / news / market intelligence
- YouTube / social / ads intelligence
- finance / regulatory intelligence
- competitive intelligence
- continuous monitoring / executive briefing

## Evidence policy

Skills consistently distinguish:

- **A authoritative** — official registries, regulators and courts
- **B observed** — direct website, DNS, public page or archive observations
- **C derived** — internally calculated scores and correlations
- **D estimated** — model-based estimates

No skill is allowed to turn an unavailable traffic model into a fake Similarweb-style number.
