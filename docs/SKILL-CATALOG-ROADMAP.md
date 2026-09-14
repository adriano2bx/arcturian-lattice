# Catálogo planejado de skills — DeltaBots Arcturian / Lattice

Este é o backlog de workflows de negócio, não uma lista de endpoints nem uma
lista de arquivos `SKILL.md`. Cada item descreve um resultado ponta a ponta e
deverá ser decomposto em skills reutilizáveis, com receita testada para coleta,
cruzamento, validação e análise. Uma skill composta pode implementar um
workflow inteiro, enquanto uma skill menor pode ser compartilhada por vários
workflows.

Legenda: **[ATIVA]** já existe e pode ser roteada; **[BLOQUEADA]** possui uma
receita, mas depende de tool/provider indisponível; **[PRÓXIMA]** é prioridade
de implementação; **[PLANEJADA]** depende de uma fase posterior.

## 1. Empresa e entidades

1. **[ATIVA]** Verificação cadastral de empresa brasileira (`company-registration-verification`)
2. **[BLOQUEADA]** Due diligence de fornecedor (`company-due-diligence`)
3. **[ATIVA]** OSINT de empresa brasileira (`company-osint-br`)
4. **[ATIVA]** Reconciliação de identidade entre CNPJ, nome, domínio e LEI (`company-identity-reconciliation`)
5. **[PRÓXIMA]** Mapa de grupo econômico e entidades relacionadas
6. **[PRÓXIMA]** Linha do tempo societária e cadastral
7. **[PRÓXIMA]** Perfil de cliente potencial para vendas enterprise
8. **[PRÓXIMA]** Validação de fornecedor antes de contratação
9. **[PLANEJADA]** Dossiê de empresa estrangeira e subsidiárias
10. **[PLANEJADA]** Comparação de múltiplas entidades com resolução de homônimos

## 2. Jurídico e conformidade

1. **[ATIVA]** Triagem de risco jurídico público (`legal-risk-screening`)
2. **[ATIVA]** Publicações judiciais por OAB com controle de cobertura (`legal-publications-oab`)
3. **[ATIVA]** Publicações judiciais por parte e validação de identidade (`legal-publications-party`)
4. **[PRÓXIMA]** Monitoramento de mudança em publicações de um processo
5. **[ATIVA]** Triagem de certidões e sinais de integridade (`regulatory-sector-screening`)
6. **[PRÓXIMA]** Matriz de evidências para revisão por advogado
7. **[PLANEJADA]** Conflito de nomes, marcas e partes relacionadas
8. **[PLANEJADA]** Due diligence regulatória por setor
9. **[PLANEJADA]** Preparação de briefing jurídico sem conclusão legal
10. **[PLANEJADA]** Reconciliação de eventos judiciais em múltiplas fontes

## 3. Governo e contratos públicos

1. **[ATIVA]** Inteligência de contratos públicos (`public-procurement-intelligence`)
2. **[ATIVA]** Histórico de fornecedor no PNCP (`pncp-supplier-history`)
3. **[PRÓXIMA]** Mapa de órgãos compradores por setor
4. **[PRÓXIMA]** Detecção de concentração de contratos
5. **[PRÓXIMA]** Identificação de oportunidades por CNAE e território
6. **[PRÓXIMA]** Análise de editais e requisitos recorrentes
7. **[PLANEJADA]** Comparação de concorrentes em licitações
8. **[PLANEJADA]** Linha do tempo de contratos e aditivos
9. **[PLANEJADA]** Qualificação de conta pública para ABM
10. **[PLANEJADA]** Briefing executivo de exposição ao setor público

## 4. Propriedade intelectual

1. **[BLOQUEADA]** Inteligência de propriedade intelectual (`intellectual-property-intelligence`)
2. **[PRÓXIMA]** Busca de marcas por titular
3. **[PRÓXIMA]** Reconciliação de titularidade e razão social
4. **[PRÓXIMA]** Portfólio de marcas de uma empresa
5. **[PRÓXIMA]** Busca de colisões nominativas por classe
6. **[PLANEJADA]** Linha do tempo de pedidos e concessões
7. **[PLANEJADA]** Sinais de patentes e programas de computador
8. **[PLANEJADA]** Monitoramento de novos depósitos de concorrentes
9. **[PLANEJADA]** Mapa de classes e categorias tecnológicas
10. **[PLANEJADA]** Relatório de ativos e lacunas de proteção

## 5. Mercado e economia

1. **[BLOQUEADA]** Pesquisa de mercado brasileiro (`market-research-br`)
2. **[PRÓXIMA]** Dimensionamento de mercado por setor
3. **[PRÓXIMA]** Dimensionamento por estado e município
4. **[PRÓXIMA]** Comparação de praças para expansão
5. **[ATIVA]** Perfil econômico de território (`territory-economic-profile`)
6. **[PRÓXIMA]** Sazonalidade e tendência em séries IBGE
7. **[PLANEJADA]** Mapa de densidade de empresas por CNAE
8. **[PLANEJADA]** Análise de comércio exterior por produto
9. **[PLANEJADA]** Cenários de entrada em mercado
10. **[PLANEJADA]** Briefing de mercado para diretoria

## 6. Financeiro e investimento

1. **[ATIVA]** Inteligência financeira brasileira (`financial-intelligence-br`)
2. **[ATIVA]** Inteligência de companhia pública dos EUA (`public-company-intelligence-us`)
3. **[ATIVA]** Leitura de séries do Banco Central (`bcb-series-reading`)
4. **[PRÓXIMA]** Reconciliação temporal de fatos SEC
5. **[PRÓXIMA]** Triagem financeira de parceiro ou fornecedor
6. **[PRÓXIMA]** Indicadores de crescimento e retração
7. **[PLANEJADA]** Comparação financeira entre concorrentes
8. **[PLANEJADA]** Exposição cambial e macroeconômica
9. **[PLANEJADA]** Preparação de cenário de investimento
10. **[PLANEJADA]** Briefing financeiro com fontes e ressalvas

## 7. Web e infraestrutura

1. **[ATIVA]** Inteligência de website (`website-intelligence`)
2. **[ATIVA]** Forense de mudanças de website (`website-change-forensics`)
3. **[ATIVA]** Inteligência de stack tecnológica (`technology-stack-intelligence`)
4. **[ATIVA]** Perfil técnico completo de domínio (`domain-profile-complete`)
5. **[PRÓXIMA]** Reconciliação DNS, RDAP e HTTP
6. **[PRÓXIMA]** Descoberta passiva de subdomínios e certificados
7. **[ATIVA]** Diagnóstico de disponibilidade e origem (`availability-infrastructure-diagnosis`)
8. **[PLANEJADA]** Mapa de ativos digitais de uma organização
9. **[PLANEJADA]** Comparação de infraestrutura de concorrentes
10. **[PLANEJADA]** Relatório de exposição técnica pública

## 8. SEO e aquisição

1. **[ATIVA]** Auditoria técnica de SEO (`seo-technical-audit`)
2. **[BLOQUEADA]** Pesquisa competitiva de SEO (`seo-competitive-research`)
3. **[BLOQUEADA]** Inteligência de backlinks (`backlink-intelligence`)
4. **[ATIVA]** Pesquisa de SERP por intenção (`serp-intent-research`)
5. **[PRÓXIMA]** Auditoria de indexabilidade e arquitetura
6. **[PRÓXIMA]** Mapa de lacunas de conteúdo
7. **[PRÓXIMA]** Comparação de presença orgânica
8. **[PLANEJADA]** Priorização de oportunidades por esforço e impacto
9. **[PLANEJADA]** Diagnóstico de páginas que perderam visibilidade
10. **[PLANEJADA]** Plano editorial baseado em evidências

## 9. Competitivo e posicionamento

1. **[BLOQUEADA]** Inteligência competitiva (`competitive-intelligence`)
2. **[PRÓXIMA]** Retrato comparativo de concorrentes
3. **[PRÓXIMA]** Matriz de diferenciação observável
4. **[PRÓXIMA]** Comparação de produtos e posicionamento
5. **[PRÓXIMA]** Mapa de segmentos e territórios concorrentes
6. **[PLANEJADA]** Detecção de movimentos de mercado
7. **[PLANEJADA]** Análise de mensagens e propostas de valor
8. **[PLANEJADA]** Cenários de ameaça competitiva
9. **[PLANEJADA]** Mapa de parceiros e canais
10. **[PLANEJADA]** Briefing competitivo executivo

## 10. Marca, reputação e mídia

1. **[ATIVA]** Inteligência de notícias (`news-event-intelligence`)
2. **[BLOQUEADA]** Escuta social (`social-listening`)
3. **[BLOQUEADA]** Monitoramento de crise reputacional (`crisis-reputation-monitoring`)
4. **[ATIVA]** Panorama de notícias por entidade (`entity-news-panorama`)
5. **[PRÓXIMA]** Reconciliação de menções e homônimos
6. **[PRÓXIMA]** Linha do tempo de narrativa pública
7. **[PLANEJADA]** Monitoramento de Reclame Aqui com API oficial
8. **[PLANEJADA]** Classificação contextual de temas e riscos
9. **[PLANEJADA]** Detecção de aceleração reputacional
10. **[PLANEJADA]** Briefing de reputação com evidências

## 11. Pesquisa e conhecimento

1. **[ATIVA]** Pesquisa acadêmica (`academic-research`)
2. **[PRÓXIMA]** Pesquisa profunda multifuente
3. **[PRÓXIMA]** Revisão bibliográfica orientada a pergunta
4. **[PRÓXIMA]** Mapa de consenso e divergência
5. **[PRÓXIMA]** Síntese com rastreabilidade de fontes
6. **[PLANEJADA]** Estado da arte por tecnologia
7. **[PLANEJADA]** Monitoramento de novas publicações
8. **[PLANEJADA]** Extração de hipóteses e lacunas
9. **[PLANEJADA]** Comparação de metodologias
10. **[PLANEJADA]** Briefing técnico para decisão

## 12. Operações e inteligência contínua

1. **[ATIVA]** Monitoramento de inteligência contínua (`continuous-intelligence-monitoring`)
2. **[ATIVA]** Briefing executivo (`executive-intelligence-brief`)
3. **[PRÓXIMA]** Criação de baseline multifuente
4. **[PRÓXIMA]** Investigação de mudança detectada
5. **[PRÓXIMA]** Relatório de cobertura e lacunas
6. **[PRÓXIMA]** Briefing diário por segmento
7. **[PLANEJADA]** Briefing semanal executivo transversal
8. **[PLANEJADA]** Priorização de alertas por evidência
9. **[PLANEJADA]** Auditoria de qualidade de dados
10. **[PLANEJADA]** Revisão de eficácia de workflow

## 13. Vendas e receita

1. **[ATIVA]** Pesquisa ABM de conta (`abm-account-research`)
2. **[BLOQUEADA]** Mapeamento de mercado e leads (`lead-market-mapping`)
3. **[ATIVA]** Inteligência de contratos para vendas públicas (`public-procurement-intelligence`)
4. **[ATIVA]** Definição e validação de ICP (`icp-definition-validation`)
5. **[PRÓXIMA]** Enriquecimento e qualificação de lead
6. **[PRÓXIMA]** Detecção de gatilhos de compra observáveis
7. **[PRÓXIMA]** Preparação de reunião de descoberta
8. **[PRÓXIMA]** Mapa de stakeholders e influência
9. **[PRÓXIMA]** Hipótese de valor e personalização de proposta
10. **[PRÓXIMA]** Inteligência de oportunidade, expansão e churn

## Fases do backlog

### Fase A — fundação (30 pacotes existentes)

Padronizar frontmatter, IDs, dependências, evidência, saída e testes das 30
skills atuais. Hoje 19 estão instaláveis e 11 estão `blocked` porque dependem
de tools desativadas; nenhuma skill bloqueada entra no roteamento automático.

### Fase B — workflows prioritários (59)

Implementar os 59 itens **[PRÓXIMA]**, começando por empresa, jurídico, governo,
mercado e operações. São os workflows com maior reutilização entre clientes e
segmentos.

### Fase C — workflows planejados (47)

Implementar os 47 itens **[PLANEJADA]** restantes da matriz base antes de criar
variações verticais.

### Fase D — especialização por setor (100+ variações)

Derivar as receitas base para jurídico, saúde, telecom, tecnologia, indústria,
serviços financeiros e setor público, combinando resultado, segmento,
profundidade, periodicidade e persona, sempre com testes próprios.

O catálogo só deve crescer quando cada skill tiver uma pergunta de decisão
clara, uma receita reproduzível e um contrato de saída verificável.
