---
name: social-listening
description: Monitors public social mentions across indexed Reddit, YouTube, X and Instagram surfaces, with direct Reddit search where available. Use for brand listening, competitor mentions, customer pain discovery or trend reconnaissance.
license: Proprietary - internal use
compatibility: Requires Hermes Agent or another Agent Skills client with the DeltaBots Arcturian / Lattice MCP configured.
metadata:
  author: "DeltaBots Arcturian / Lattice"
  version: "1.0.0"
  category: "social"
  mcp-server: "arcturian-lattice"
---
# Social Listening

1. Define brand names, product names, executive names and category terms.
2. Use `social.search_mentions` for broad public indexing and `reddit.search` for direct Reddit discovery.
3. Cluster mentions by theme: praise, complaint, question, comparison, purchase intent, support issue and feature request.
4. Treat sentiment as qualitative unless a validated classifier is configured.
5. Use `news.search` to distinguish organic discussion from news-driven spikes.

Never claim complete coverage of closed or anti-bot social platforms.

## Arcturian Lattice MCP tools used
`social.search_mentions`, `reddit.search`, `news.search`

