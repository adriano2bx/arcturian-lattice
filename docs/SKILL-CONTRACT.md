# Contrato técnico de skills — Arcturian / Lattice

Este contrato define o formato mínimo para uma skill funcionar em qualquer
cliente compatível com Agent Skills. O frontmatter permanece compatível com o
padrão aberto; os campos adicionais são convenções do ecossistema DeltaBots.

## Hierarquia conceitual

Não são sinônimos:

```text
Segmento
  └── Workflow (resultado de negócio ponta a ponta)
        └── Skills (módulos/receitas reutilizáveis)
              └── Tools MCP (primitives de dados e execução)
```

Um **workflow** responde a uma decisão completa, por exemplo “qualificar uma
conta para vendas”. Ele pode compor várias skills: resolver identidade,
enriquecer a conta, detectar gatilhos, pontuar evidências e montar o briefing.
Uma **skill** é uma unidade carregável por qualquer agente e pode ser usada em
mais de um workflow. Uma **tool** apenas coleta ou transforma uma observação;
ela não é um workflow.

O backlog de 130 itens em `SKILL-CATALOG-ROADMAP.md` é uma matriz de workflows
de negócio. Ele não significa automaticamente 130 arquivos `SKILL.md`: cada
workflow será decomposto em skills reutilizáveis e algumas skills poderão
atender vários workflows.

## Camadas de carregamento

1. **Descoberta:** `name`, `description` e `metadata` permitem ao agente
   selecionar a skill sem carregar o corpo.
2. **Execução:** o corpo de `SKILL.md` contém a receita comum, os limites e o
   contrato de saída.
3. **Detalhamento:** `references/` contém schemas, taxonomias e casos de uso
   específicos; deve ser lido apenas quando a etapa exigir.

## Frontmatter obrigatório

```yaml
---
name: sales-account-qualification
description: Qualifica uma conta B2B com evidências públicas antes de priorizar uma oportunidade comercial.
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
  tools: "company.profile,company.osint,web.profile,news.search"
---
```

`name` e `description` seguem o padrão Agent Skills. `status` pode ser
`active`, `draft`, `deprecated` ou `blocked`; somente `active` entra no
roteamento automático. A versão da skill é independente da versão do MCP.

## Seções obrigatórias do corpo

Toda skill 2.0 deve conter, nesta ordem:

1. **Objective** — resultado de decisão produzido.
2. **When to use / When not to use** — roteamento e limites.
3. **Inputs** — campos necessários, opcionais e formato.
4. **Preconditions** — o que validar antes da primeira chamada.
5. **Workflow** — passos numerados, dependências e chamadas de tools.
6. **Evidence and validation** — fontes, identidade, temporalidade e conflitos.
7. **Decision rules** — como priorizar sem inventar intenção ou causalidade.
8. **Output contract** — campos obrigatórios, tipos e nível de confiança.
9. **Failure handling** — ausência, erro, cobertura parcial e retry limitado.
10. **Privacy and safety** — dados pessoais, uso permitido e proibições.
11. **Tool mapping** — tools do MCP usadas, sem expor APIs internas.
12. **Examples and tests** — casos normal, incompleto e conflitante.

## Regras de execução

- Nunca trate ausência de registro como prova de ausência.
- Toda afirmação deve apontar para uma evidência e sua data de observação.
- Entidades são reconciliadas por identificadores antes de nomes parecidos.
- Fontes conflitantes permanecem visíveis; não são resolvidas por palpite.
- Resultados derivados são separados de fatos observados.
- O agente decide a ordem e a frequência de execução; a skill não cria
  agendamentos nem chama APIs fora do catálogo autorizado.
- Uma falha de provider reduz a cobertura, mas não pode ser convertida em dado
  estimado sem declarar método e incerteza.

## Níveis de evidência

| Nível | Significado | Exemplos |
| --- | --- | --- |
| A | fonte oficial/primária | registro público, regulador, tribunal |
| B | observação direta | página, DNS, HTTP, captura pública |
| C | derivação reproduzível | correlação, score, agrupamento |
| D | estimativa/modelo | projeção explicitamente calibrada |

## Contrato de saída

Uma skill deve retornar, no mínimo:

```json
{
  "skill": "<name>",
  "skillVersion": "<semver>",
  "status": "complete|partial|blocked",
  "subject": {},
  "findings": [],
  "evidence": [],
  "conflicts": [],
  "gaps": [],
  "confidence": "high|medium|low",
  "observedAt": "<ISO-8601>"
}
```

O formato pode ser enriquecido pelo workflow, mas esses campos não devem ser
removidos. Skills que não conseguem cumprir o contrato devem declarar
`partial` ou `blocked`, nunca fabricar uma resposta completa.
