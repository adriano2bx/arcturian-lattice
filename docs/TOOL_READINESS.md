# Lattice tool readiness

Última verificação: 2026-09-14. O endpoint de produção respondeu a `tools/list` com 41 tools habilitadas.

## Estado

| Estado                           | Quantidade | Significado                                                                                          |
| -------------------------------- | ---------: | ---------------------------------------------------------------------------------------------------- |
| Operacional verificado           |         41 | Chamada autenticada concluída com resposta válida no endpoint de produção.                           |
| Dependência externa/configuração |          6 | A implementação está publicada, mas requer credencial, dataset local ou provedor externo disponível. |
| Não executado no smoke test      |          0 | Todas as tools foram chamadas; as mutáveis foram executadas com escopo limitado.                     |

### Operacional verificado

`company.validate_cnpj`, `company.profile`, `company.public_contracts`, `company.risk`, `legal.publications_by_oab`,
`company.gazette`, `company.global`, `company.legal`, `web.profile`, `web.technology`, `research.papers`, `market.weather`,
`market.crypto_rates`, `competitive.snapshot`, `monitor.list`, `monitor.events`,
`monitor.create`, `monitor.run`, `monitor.run_due`, `regulatory.sync_anatel`,
`regulatory.search`, `seo.audit`, `market.ibge`, `youtube.metadata`,
`finance.bcb_series`, `finance.sec_companyfacts`, `finance.sec_submissions`,
`competitive.compare`, `osint.subdomains`, `infra.network`, `infra.peering`,
`web.search`, `seo.serp`, `social.search_mentions`, `ads.search_public`,
`news.search`, `research.deep`, `web.sitemap`, `geo.search`, `company.osint`.

### Dependência externa/configuração

`company.ip`, `seo.backlinks`, `youtube.transcript`, `reddit.search`,
`competitive.traffic_estimate`, `market.open_data`.

Isso não significa que o código esteja ausente. Cada tool retorna falha estruturada quando sua
fonte não está configurada ou indisponível; não produz dados estimados como se fossem oficiais.

As seis capabilities pendentes permanecem no código, mas estão desativadas no registro MCP e
não aparecem em `tools/list` nem no catálogo público: `company.ip`, `seo.backlinks`,
`youtube.transcript`, `reddit.search`, `competitive.traffic_estimate` e `market.open_data`.

As operações mutáveis foram validadas com um monitor temporário de produção e a sincronização
ANATEL foi concluída: `17.606` registros deduplicados, todas as 37 páginas processadas e estado
`ready`. O cron permanece habilitado para futuras atualizações incrementais.

## Gates automatizados

`npm test`: 67 testes, 60 aprovados, 0 falhas e 7 testes live ignorados por dependerem de rede.
