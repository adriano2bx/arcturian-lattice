# Runbook de workflows e skills

Este documento define como o catálogo é operado sem confundir planejamento com
capacidade disponível.

## Estados

| Estado do workflow | Estado da skill | Pode ser roteado? | Critério |
| --- | --- | --- | --- |
| `active` | `active` | Sim | Receita versionada, tools válidas e testes verdes |
| `blocked` | `blocked` | Não | Provider/tool ausente, desativado ou sem cobertura suficiente |
| `planned` | inexistente ou `draft` | Não | Variação futura ainda sem receita executável |

O campo `routable` do `skills/workflows.json` é a fonte determinística para
clientes. Nunca derive disponibilidade apenas do nome ou da existência de um
arquivo.

## Promoção de workflow

1. Definir a pergunta de negócio, segmento e contrato de saída.
2. Mapear skills reutilizáveis e tools MCP reais; nenhuma API privada é exposta.
3. Escrever a receita v2 com evidência, validação, falhas, privacidade e testes.
4. Registrar a skill em `skills/manifest.json` com `status: active` somente após
   `npm run skills:validate`.
5. Vincular o workflow no roadmap e executar `npm run workflows:generate`.
6. Confirmar `npm run workflows:validate` e `npm test`.
7. Fazer deploy apenas depois do dry-run do Wrangler e do smoke de produção.

## Bloqueios

Quando uma tool/provider fica indisponível, a skill deve receber `status:
blocked`, o workflow deve receber `blocked` e o motivo deve aparecer em
`implementation.blockers`. A receita permanece no repositório para reativação
posterior, mas não entra no instalador nem em `tools/list`.

## Verificação rápida

```bash
npm run skills:validate
npm run workflows:generate
npm run workflows:validate
npm test
```

O agente continua responsável por escolher ordem, parâmetros, frequência,
deduplicação, validação e eventual ação no sistema de destino. O MCP fornece
primitivas, autenticação, isolamento de tenant, quotas e normalização; não
executa regras de negócio do workflow por conta própria.
