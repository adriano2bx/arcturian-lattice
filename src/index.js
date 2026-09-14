import { createMcpHandler } from "agents/mcp/server";
import {
  createArcturianLatticeMcpServer,
  ARCTURIAN_VERSION,
} from "./mcp/create-server.js";
import { AnatelSyncService } from "./services/anatel-sync.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/healthz") {
      return Response.json({
        ok: true,
        service: "arcturian-lattice",
        version: ARCTURIAN_VERSION,
        mcp: "/mcp",
        continuousIntelligence: Boolean(env.DB),
      });
    }

    if (url.pathname !== "/mcp") {
      return new Response("Not found", { status: 404 });
    }

    if (
      request.method !== "OPTIONS" &&
      env.CONTROL_PLANE &&
      env.INTERNAL_AUTH_SECRET
    ) {
      const verified = await env.CONTROL_PLANE.fetch(
        "https://control.internal/internal/auth/verify",
        {
          method: "POST",
          headers: {
            authorization: request.headers.get("authorization") ?? "",
            "x-deltabots-internal-secret": env.INTERNAL_AUTH_SECRET,
          },
        },
      );
      if (!verified.ok)
        return new Response(await verified.text(), {
          status: verified.status,
          headers: {
            "content-type": "application/json",
            "www-authenticate": verified.status === 401 ? "Bearer" : "",
          },
        });
    } else if (request.method !== "OPTIONS" && env.MCP_TOKEN) {
      const expected = `Bearer ${env.MCP_TOKEN}`;

      if (request.headers.get("authorization") !== expected) {
        return Response.json(
          {
            error: "unauthorized",
            message: "Missing or invalid Bearer token.",
          },
          {
            status: 401,
            headers: {
              "www-authenticate": "Bearer",
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
        route: "/mcp",
        responseMode: "json",
        onerror(error) {
          console.error("MCP handler error", error);
        },
      },
    );

    return handler(request, env, ctx);
  },

  async scheduled(_event, env, ctx) {
    if (!env.DB) return;

    const fetchFn = (...args) => globalThis.fetch(...args);

    // Keep official ANATEL data moving toward a complete mirror. The service
    // processes one idempotent page per cron invocation and never exposes a
    // partial dataset as ready to consumers.
    const anatelRun = new AnatelSyncService({
      db: env.DB,
      fetchFn,
    })
      .syncNextPage()
      .catch((error) => console.error("scheduled ANATEL sync error", error));

    ctx.waitUntil(anatelRun);
  },
};
