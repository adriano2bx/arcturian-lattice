import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('MCP v1 exposes the complete high-level capability surface', async () => {
  const source=await fs.readFile(new URL('../src/mcp/create-server.js',import.meta.url),'utf8');
  const names=[...source.matchAll(/tool\(\s*server,\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
  assert.equal(names.length,46);
  for(const required of ['company.osint','web.history','web.technology','seo.audit','seo.backlinks','research.deep','news.search','market.ibge','youtube.transcript','social.search_mentions','finance.bcb_series','competitive.snapshot','competitive.traffic_estimate','monitor.run_due','web.sitemap','osint.subdomains','infra.network','infra.peering','geo.search','regulatory.search','market.open_data']) assert.ok(names.includes(required),required);
  assert.equal(new Set(names).size,names.length,'tool names must be unique');
});
