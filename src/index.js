import { createMcpHandler } from 'agents/mcp/server';
import { createArcturianLatticeMcpServer, ARCTURIAN_VERSION } from './mcp/create-server.js';
import { MonitorService } from './services/monitor.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/healthz') {
      return Response.json({
        ok: true,
        service: 'arcturian-lattice',
        version: ARCTURIAN_VERSION,
        mcp: '/mcp',
        continuousIntelligence: Boolean(env.DB),
      });
    }

    if (url.pathname !== '/mcp') {
      return new Response('Not found', { status: 404 });
    }

    if (request.method !== 'OPTIONS' && env.CONTROL_AUTH_URL && env.INTERNAL_AUTH_SECRET) {
      const verified = await fetch(env.CONTROL_AUTH_URL, { method: 'POST', headers: { authorization: request.headers.get('authorization') ?? '', 'x-deltabots-internal-secret': env.INTERNAL_AUTH_SECRET } });
      if (!verified.ok) return new Response(await verified.text(), { status: verified.status, headers: { 'content-type': 'application/json', 'www-authenticate': verified.status === 401 ? 'Bearer' : '' } });
    } else if (request.method !== 'OPTIONS' && env.MCP_TOKEN) {
      const expected = `Bearer ${env.MCP_TOKEN}`;

      if (request.headers.get('authorization') !== expected) {
        return Response.json(
          {
            error: 'unauthorized',
            message: 'Missing or invalid Bearer token.',
          },
          {
            status: 401,
            headers: {
              'www-authenticate': 'Bearer',
            },
          },
        );
      }
    }

    // Cloudflare runtime APIs must keep their invocation context.
    // Wrapping fetch avoids "Illegal invocation" when it is injected
    // into providers/services and later called as a standalone function.
    const fetchFn = (...args) => globalThis.fetch(...args);

    const handler = createMcpHandler(
      () => createArcturianLatticeMcpServer({ env, fetchFn }),
      {
        route: '/mcp',
        responseMode: 'json',
        onerror(error) {
          console.error('MCP handler error', error);
        },
      },
    );

    return handler(request, env, ctx);
  },

  async scheduled(_event, env, ctx) {
    if (!env.DB) return;

    const fetchFn = (...args) => globalThis.fetch(...args);

    ctx.waitUntil(
      new MonitorService({
        db: env.DB,
        fetchFn,
      })
        .runDue({ limit: 5 })
        .catch((error) => console.error('scheduled monitor error', error)),
    );
  },
};
