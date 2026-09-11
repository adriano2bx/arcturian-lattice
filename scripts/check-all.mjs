import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(p.endsWith('.js')||p.endsWith('.mjs'))out.push(p)}return out}
const files=[...await walk('src'),...await walk('scripts')];for(const f of files){const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)}console.log(`syntax ok: ${files.length} files`);
