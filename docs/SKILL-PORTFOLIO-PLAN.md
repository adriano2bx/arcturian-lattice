# Arcturian / Lattice — plano de skills por workflow e segmento

## Princípio

Uma tool entrega uma observação. Uma skill entrega um resultado de negócio:
define a pergunta, escolhe as fontes, combina chamadas, valida identidade e
tempo, classifica evidências e determina o formato da resposta.

O catálogo será organizado primeiro por **segmento de decisão** e depois por
**workflow**. O nome da skill deve expressar o resultado produzido, não a API
consultada.

## Taxonomia de segmentos

| Segmento | Decisões atendidas | Famílias de workflow |
| --- | --- | --- |
| Empresa e entidades | quem é a entidade e qual sua estrutura | identificação, cadastro, relacionamentos, due diligence |
| Jurídico e conformidade | quais sinais exigem revisão humana | publicações, risco, integridade, conflitos, evidências |
| Governo e contratos | onde estão oportunidades e exposição pública | fornecedores, licitações, contratos, concentração |
| Propriedade intelectual | quais ativos e riscos de marca existem | marcas, patentes, titularidade, colisões |
| Mercado e economia | tamanho, dinâmica e atratividade de mercados | dimensionamento, território, setor, indicadores |
| Financeiro e investimento | saúde, exposição e desempenho financeiro | demonstrações, séries, filings, cenários |
| Web e infraestrutura | como uma presença digital é construída | perfil, tecnologia, DNS, rede, histórico |
| SEO e aquisição | como encontrar demanda e lacunas de visibilidade | auditoria, SERP, conteúdo, oportunidades |
| Competitivo | como comparar empresas e posicionamento | benchmark, mapa competitivo, diferenciação |
| Marca, reputação e mídia | o que o mercado está dizendo e como evolui | notícias, menções, crise, sentimento contextual |
| Pesquisa e conhecimento | o que a evidência técnica sustenta | literatura, panorama, síntese, hipóteses |
| Operações e monitoramento | o que mudou e requer atenção | baseline, detecção, investigação, briefing |

## Tipos de workflow

Cada segmento terá skills em cinco níveis:

1. **Leitura** — uma pergunta objetiva, poucas fontes e saída factual.
2. **Diagnóstico** — coleta multifuente, validação e explicação de divergências.
3. **Decisão** — diagnóstico convertido em opções, riscos e próximos passos.
4. **Monitoramento** — baseline, janela temporal, mudanças e severidade.
5. **Executivo** — síntese transversal com evidências, confiança e pendências.

## Backlog inicial de workflows

### Empresa, jurídico e governo

- Verificação cadastral de empresa brasileira
- Dossiê de due diligence de fornecedor
- Dossiê de parceiro ou cliente potencial
- Mapa de grupo econômico e entidades relacionadas
- Triagem de risco jurídico público
- Busca diária de publicações por OAB
- Busca de publicações por parte
- Exposição a contratos públicos
- Concentração de fornecedores e órgãos
- Validação de identidade entre fontes
- Reconciliação de nomes, CNPJ e domínios
- Linha do tempo pública de uma empresa

### Mercado, financeiro e investimento

- Dimensionamento de mercado por setor e território
- Expansão regional orientada por indicadores
- Perfil macroeconômico de uma praça
- Comparação setorial entre estados/municípios
- Leitura de séries BCB/IBGE
- Triagem financeira de companhia pública
- Extração de fatos SEC e reconciliação temporal
- Sinais de crescimento, retração ou sazonalidade
- Mapa de oportunidade por segmento
- Briefing de entrada em mercado

### Web, SEO e competitivo

- Perfil técnico completo de domínio
- Reconstrução de mudanças de website
- Diagnóstico de stack tecnológica
- Auditoria técnica de SEO
- Pesquisa de SERP e intenção
- Mapa de lacunas de conteúdo
- Comparação técnica de concorrentes
- Mapa de presença digital
- Descoberta de subdomínios e ativos públicos
- Diagnóstico de disponibilidade e infraestrutura

### Marca, reputação, pesquisa e operações

- Panorama de notícias sobre entidade
- Escuta de menções públicas
- Investigação de crise reputacional
- Briefing de reputação com fontes e incertezas
- Revisão bibliográfica orientada a pergunta
- Pesquisa profunda com síntese verificável
- Baseline de inteligência contínua
- Investigação de mudança detectada
- Briefing diário/semanal executivo
- Relatório de evidências pendentes

## Composição padrão de uma skill

Toda nova skill deverá conter:

- objetivo e pergunta de decisão;
- público e segmento;
- pré-condições e dados necessários;
- sequência de coleta;
- regras de identidade e normalização;
- matriz de cruzamento entre fontes;
- níveis de evidência (A, B, C, D);
- tratamento de fonte ausente ou conflitante;
- critérios de parada e limites;
- formato de saída e campos obrigatórios;
- riscos, privacidade e proibições;
- exemplos de entrada/saída;
- testes com fixtures e casos adversos;
- versão, changelog e tools habilitadas.

## Ordem de construção

1. Consolidar os workflows de empresa, jurídico e governo.
2. Criar os workflows de mercado e financeiro.
3. Completar web, SEO e competitivo.
4. Adicionar reputação, mídia e pesquisa.
5. Criar monitoramento e briefings executivos compostos.
6. Gerar variações por setor (jurídico, saúde, telecom, tecnologia,
   indústria, serviços financeiros e setor público).

O objetivo de escala é chegar a centenas de skills por combinação de
**resultado × segmento × profundidade**, sem duplicar receitas: uma skill
especializada deve reutilizar blocos de coleta, validação e evidência.
