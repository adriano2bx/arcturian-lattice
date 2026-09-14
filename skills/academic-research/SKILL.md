---
name: academic-research
description: Performs evidence-oriented literature discovery with Crossref and OpenAlex, then synthesizes results with source provenance. Use for technical research, evidence reviews, scientific background or citation discovery.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "research"
  mcp-server: "arcturian-lattice"
---
# Academic Research

1. Start with `research.papers` for focused scholarly discovery.
2. Use `research.deep` when web/news context is also needed.
3. Prefer primary papers, systematic reviews and authoritative sources over commentary.
4. Deduplicate by DOI/title and note publication date.
5. Never treat an abstract or search snippet as equivalent to reading the full paper.

Return key findings, disagreements, evidence strength, citations/identifiers and unanswered questions.

## Arcturian Lattice MCP tools used
`research.papers`, `research.deep`

