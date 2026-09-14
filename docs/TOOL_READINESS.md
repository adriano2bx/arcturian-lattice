# Lattice tool readiness

Última verificação: 2026-09-14. O endpoint de produção respondeu a `tools/list` com 47 tools.

## Estado

| Estado | Quantidade | Significado |
| --- | ---: | --- |
| Operacional verificado | 16 | Chamada autenticada concluída com resposta válida no endpoint de produção. |
| Dependência externa/configuração | 27 | A implementação está publicada, mas requer credencial, dataset local ou provedor externo disponível. |
| Não executado no smoke test | 4 | Operações mutáveis/sincronizações deliberadamente não executadas para não alterar dados. |

### Operacional verificado

`company.validate_cnpj`, `company.profile`, `company.risk`, `legal.publications_by_oab`,
`company.global`, `web.profile`, `web.technology`, `research.papers`, `market.weather`,
`market.crypto_rates`, `competitive.snapshot`, `monitor.list`, `monitor.events`,
`osint.subdomains`, `infra.network`, `infra.peering`.

### Dependência externa/configuração

`company.public_contracts`, `company.legal`, `company.ip`, `company.gazette`, `company.osint`,
`web.history`, `web.search`, `seo.audit`, `seo.serp`, `seo.backlinks`, `research.deep`,
`news.search`, `market.ibge`, `youtube.metadata`, `youtube.transcript`, `reddit.search`,
`social.search_mentions`, `ads.search_public`, `finance.bcb_series`, `finance.sec_companyfacts`,
`finance.sec_submissions`, `competitive.compare`, `competitive.traffic_estimate`, `web.sitemap`,
`geo.search`, `regulatory.search`, `market.open_data`.

Isso não significa que o código esteja ausente. Cada tool retorna falha estruturada quando sua
fonte não está configurada ou indisponível; não produz dados estimados como se fossem oficiais.

### Não executado no smoke test

`monitor.create`, `monitor.run`, `monitor.run_due`, `regulatory.sync_anatel`.

Essas operações alteram estado ou iniciam sincronização e devem ser validadas em um ambiente de
homologação com dados de teste.

## Gates automatizados

`npm test`: 66 testes, 59 aprovados, 0 falhas e 7 testes live ignorados por dependerem de rede.

