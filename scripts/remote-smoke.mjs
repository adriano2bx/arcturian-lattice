const endpoint=process.argv[2];const token=process.env.MCP_TOKEN;if(!endpoint)throw new Error('Usage: MCP_TOKEN=... node scripts/remote-smoke.mjs https://worker.example/mcp');
const headers={'content-type':'application/json','accept':'application/json, text/event-stream',...(token?{authorization:`Bearer ${token}`}:{})};
async function rpc(method,params={}){const r=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:crypto.randomUUID(),method,params})});const text=await r.text();if(!r.ok)throw new Error(`${r.status}: ${text}`);return text;}
console.log('initialize:',await rpc('initialize',{protocolVersion:'2026-07-28',capabilities:{},clientInfo:{name:'nexus-smoke',version:'1'}}));
console.log('tools/list:',await rpc('tools/list',{}));
