---
name: youtube-content-intelligence
description: Analyzes YouTube videos and transcripts for themes, hooks, positioning, claims and content opportunities. Use for competitor channel research, content strategy, video summarization or transcript-driven intelligence.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "social"
  mcp-server: "arcturian-lattice"
---
# YouTube Content Intelligence

1. Call `youtube.metadata` for each relevant video.
2. Call `youtube.transcript`; note whether the transcript came from an observed caption source, self-hosted transcription or external fallback.
3. Extract recurring topics, hooks, offers, objections, products, calls to action and named entities.
4. Compare multiple videos rather than overgeneralizing from one.
5. Use `web.search` only for external context.

Deliver content patterns, white-space opportunities, reusable topic clusters and evidence excerpts by timestamp when available.

## Arcturian Lattice MCP tools used
`youtube.metadata`, `youtube.transcript`, `web.search`

