# DeltaBots Arcturian / Lattice Skills

Internal Agent Skills library for the DeltaBots Arcturian / Lattice MCP. Each skill follows the open Agent Skills `SKILL.md` format and encodes a multi-tool workflow rather than wrapping a single endpoint.

## Hermes

```bash
npm run skills:validate
npm run skills:install -- --target hermes
```

The installer copies skills to `$HERMES_HOME/skills/` when `HERMES_HOME` is set, otherwise `~/.hermes/skills/`. Use `--force` to replace an existing same-named skill.

## Other supported targets

`claude`, `codex`, and `cursor` are supported by the local installer for portability.

## Design rule

Skills are intentionally high-level workflows. The MCP exposes stable capabilities; each skill teaches the agent how to combine them, grade evidence, handle missing providers, and avoid false precision.
