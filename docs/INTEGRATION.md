# Arcturian Lattice — Integration Guide

**DeltaBots / Arcturian / Lattice** é uma camada de dados empresariais para agentes de IA. O MCP fornece dados e capabilities factuais; interpretação, correlação e decisão permanecem no agente.

## Endpoint

Produção: `https://lattice.deltabots.com.br/mcp`

Healthcheck público: `GET https://lattice.deltabots.com.br/healthz`

O endpoint de produção exige `Authorization: Bearer <token>`. O healthcheck não exige credencial.

## Negociação MCP

O cliente deve enviar `Accept: application/json, text/event-stream` e inicializar a sessão:

```bash
curl -X POST https://lattice.deltabots.com.br/mcp \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"my-agent","version":"1.0.0"}}}'
```

Depois, use `tools/list` para descobrir apenas as capabilities habilitadas para o contexto do cliente. Nunca codifique a lista localmente: ela pode variar por tenant, plano, scope ou versão.

## Chamada de tool

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "company.validate_cnpj",
    "arguments": {"cnpj": "00.000.000/0001-91"}
  }
}
```

## Superfície atual

Lattice expõe 41 tools habilitadas em produção, organizadas em company, legal, web, SEO, research, news, market, finance, social, competitive, monitoring, infrastructure, geo e regulatory. A lista normativa e os schemas são sempre obtidos por `tools/list`; capabilities em preparação não são anunciadas.

## Publicações por OAB

A tool `legal.publications_by_oab` consulta publicações públicas do DJEN para uma inscrição da OAB. O agente cliente decide a frequência, o intervalo consultado, a deduplicação e a forma de alerta; o MCP não mantém regras de automação jurídica.

Parâmetros: `oab`, `uf` (opcional), `dateFrom`, `dateTo`, `tribunal`, `page` e `pageSize`. O resultado é informacional e não constitui conclusão jurídica.

Catálogo funcional público (nomes de capability e finalidade, sem expor provedores ou APIs internas):
`https://deltabots.com.br/pt-BR/products/arcturian/lattice/integration/tools/`

## Respostas e erros

- `200`: resposta MCP válida; o resultado pode indicar `ok`, `partial_success` ou ausência de registros.
- `400`: argumentos inválidos ou obrigatórios ausentes.
- `401`: token ausente, inválido ou revogado.
- `403`: tenant, subscription ou capability sem autorização.
- `404`: método ou caminho inexistente.
- `503`: provider ou dataset indisponível; o agente não deve tratar isso como ausência de dados.

Resultados devem ser interpretados conforme a evidência e a cobertura retornadas. Nenhuma tool declara risco jurídico, relevância comercial ou recomendação sem que isso seja produzido explicitamente por uma camada de agente/Skill.

## Segurança e operação

Tokens são credenciais privadas e devem ser armazenados em secret manager. Não registre tokens, argumentos ou respostas completas em logs. Use timeout, retry limitado e idempotência no cliente. O endpoint é multi-tenant e aplica autorização antes da execução.

## Ambientes

O hostname de produção é o único endpoint para clientes. Ambientes de staging e testes devem usar credenciais e dados separados. Não use `workers.dev` em integrações permanentes.

## Versionamento

O servidor informa sua versão em `healthz` e `initialize`. Tools podem ser adicionadas de forma compatível; alterações incompatíveis exigem nova versão de contrato e changelog. Consulte este documento e o changelog antes de atualizar um agente.
