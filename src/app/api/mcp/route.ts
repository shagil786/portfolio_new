import { handleMcpMessage } from "@/lib/mcpServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MCP Streamable HTTP transport. Mounted at /.well-known/mcp via a rewrite in
 * next.config.mjs (dot-prefixed app-router segments are not routable).
 * Stateless: no session ids, no auth — the data is public and read-only.
 */
export async function POST(req: Request) {
  // Per the MCP spec, validate Origin when the client sends one to block
  // DNS-rebinding attacks from browsers.
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) {
        return new Response("Forbidden", { status: 403 });
      }
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32600, message: "Content-Type must be application/json" },
      }),
      { status: 415, headers: { "Content-Type": "application/json" } }
    );
  }

  let message: unknown;
  try {
    message = await req.json();
  } catch {
    return Response.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
  }

  const { status, body } = handleMcpMessage(message);
  if (body === null) {
    return new Response(null, { status });
  }
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// No server-initiated SSE stream → the spec requires 405 for GET/DELETE.
export async function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
