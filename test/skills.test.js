import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'..');
const manifest = JSON.parse(await fs.readFile(path.join(root,'skills/manifest.json'),'utf8'));
const mcpSource = await fs.readFile(path.join(root,'src/mcp/create-server.js'),'utf8');

test('skills catalog contains a substantial internal workflow library', () => {
  assert.equal(manifest.server,'arcturian-lattice');
  assert.ok(manifest.skills.length >= 25);
});

test('every skill follows core Agent Skills naming/frontmatter rules and references known MCP tools', async () => {
  const names = new Set();
  for (const skill of manifest.skills) {
    assert.match(skill.name,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(skill.name.length <= 64);
    assert.ok(!names.has(skill.name)); names.add(skill.name);
    const file = path.join(root,skill.path);
    const text = await fs.readFile(file,'utf8');
    assert.ok(text.startsWith('---\n'));
    assert.ok(text.includes(`\nname: ${skill.name}\n`));
    assert.match(text,/\ndescription: .+\n/);
    assert.ok(text.includes('\ncompatibility: '));
    assert.ok(text.split('\n').length <= 500);
    for (const tool of skill.tools) assert.ok(mcpSource.includes(`'${tool}'`), `${skill.name} references unknown tool ${tool}`);
  }
});

test('skills CLI validates the catalog', async () => {
  const result = await run(['scripts/skills.mjs','validate']);
  assert.equal(result.code,0,result.stderr);
  assert.match(result.stdout,/Validated \d+ skills successfully/);
});

test('skills installer installs all skills into an isolated Hermes home', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(),'nexus-hermes-skills-'));
  try {
    const result = await run(['scripts/skills.mjs','install','--target','hermes'], { HERMES_HOME: temp });
    assert.equal(result.code,0,result.stderr);
    const entries = await fs.readdir(path.join(temp,'skills'),{withFileTypes:true});
    assert.equal(entries.filter(e=>e.isDirectory()).length,manifest.skills.length);
    const sample = await fs.readFile(path.join(temp,'skills','competitive-intelligence','SKILL.md'),'utf8');
    assert.match(sample,/competitive\.snapshot/);
  } finally { await fs.rm(temp,{recursive:true,force:true}); }
});

function run(args, extraEnv={}) {
  return new Promise((resolve,reject) => {
    const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...extraEnv}});
    let stdout='',stderr='';
    child.stdout.on('data',d=>stdout+=d);
    child.stderr.on('data',d=>stderr+=d);
    child.on('error',reject);
    child.on('close',code=>resolve({code,stdout,stderr}));
  });
}
