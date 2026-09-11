# Test matrix

## Gate A — deterministic core
- CNPJ numeric normalization and validation.
- Official Receita Federal alphanumeric DV example.
- First alphanumeric CNPJ published by Receita Federal.
- Invalid DV rejection.

## Gate B — provider contract
- Provider capability detection.
- Success payload normalization.
- 404/upstream/network failure normalization.
- No silent fallback from alphanumeric to numeric-only providers.

## Gate C — service orchestration
- Provider fallback order.
- Provenance metadata.
- Invalid identifiers rejected before network calls.
- Explicit capability gap when no provider supports a format.

## Gate D — live integration (networked CI / developer machine)
- BrasilAPI numeric profile lookup.
- MCP initialize/list-tools/call-tool against `wrangler dev`.
- Bearer-token rejection/acceptance.
- Cloudflare deployment smoke test.

## Gate E — Phase 2 legal adapter
- JSON-RPC `tools/call` request shape for Judiciario BR MCP.
- Bearer token forwarding.
- `buscar_por_parte` argument normalization.
- `structuredContent` and text-content decoding.
- Tool-level error preservation (including upstream DJEN failures).

## Gate F — Phase 2 IP local mirror
- D1 query path by CNPJ.
- Official-source metadata preserved.
- Dataset-not-configured is explicit, never silently replaced by a paid API.
- Malformed optional JSON fields fail closed.

## Gate G — Phase 2 web profile
- URL/domain normalization.
- HTTP metadata parsing.
- IANA RDAP bootstrap resolution.
- RDAP response normalization.
- Partial-success behavior across HTTP/DNS/RDAP providers.

## Gate H — live Phase 2 integration (networked CI / deployed Worker)
- `company.legal` against the configured operational Judiciario BR MCP.
- `company.ip` after official INPI data is loaded into D1.
- `web.profile` against a known domain, validating HTTP, DoH and RDAP independently.
