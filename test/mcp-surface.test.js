import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { DISABLED_TOOLS } from '../src/mcp/create-server.js';

test('MCP v1 exposes the complete high-level capability surface', async () => {
  const source=await fs.readFile(new URL('../src/mcp/create-server.js',import.meta.url),'utf8');
  const names=[...source.matchAll(/tool\(\s*server,\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
  assert.equal(names.length,47);
  const active=names.filter((name)=>!DISABLED_TOOLS.has(name));
  assert.equal(active.length,41);
  for(const required of ['company.osint','legal.publications_by_oab','web.history','web.technology','seo.audit','research.deep','news.search','market.ibge','social.search_mentions','finance.bcb_series','competitive.snapshot','monitor.run_due','web.sitemap','osint.subdomains','infra.network','infra.peering','geo.search','regulatory.search']) assert.ok(active.includes(required),required);
  for(const disabled of DISABLED_TOOLS) assert.ok(!active.includes(disabled),disabled);
  assert.equal(new Set(names).size,names.length,'tool names must be unique');
});
