import { createMcpHandler } from 'agents/mcp/server';
import { createNexusMcpServer, NEXUS_VERSION } from './mcp/create-server.js';
import { MonitorService } from './services/monitor.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/healthz') return Response.json({ ok:true,service:'nexus-intelligence-mcp',version:NEXUS_VERSION,mcp:'/mcp',continuousIntelligence:Boolean(env.DB) });
    if (url.pathname !== '/mcp') return new Response('Not found',{status:404});
    if (request.method !== 'OPTIONS' && env.MCP_TOKEN) {
      const expected=`Bearer ${env.MCP_TOKEN}`;
      if(request.headers.get('authorization')!==expected)return Response.json({error:'unauthorized',message:'Missing or invalid Bearer token.'},{status:401,headers:{'www-authenticate':'Bearer'}});
    }
    const handler=createMcpHandler(()=>createNexusMcpServer({env,fetchFn:globalThis.fetch}),{route:'/mcp',responseMode:'json',onerror(error){console.error('MCP handler error',error)}});
    return handler(request,env,ctx);
  },
  async scheduled(_event, env, ctx) {
    if (!env.DB) return;
    ctx.waitUntil(new MonitorService({db:env.DB,fetchFn:globalThis.fetch}).runDue({limit:5}).catch(error=>console.error('scheduled monitor error',error)));
  },
};
