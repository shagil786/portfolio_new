import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live "online now" presence.
 *
 * Clients POST a heartbeat with a session id every ~12s. We count sessions seen
 * within TTL.
 *
 * - DEPLOYED (accurate, global): if Vercel KV / Upstash Redis env vars are set
 *   (KV_REST_API_URL + KV_REST_API_TOKEN), we use a Redis sorted set so the
 *   count is correct across all serverless instances. Add a free KV store via
 *   the Vercel dashboard ("Storage → KV") and these vars are injected for you.
 * - LOCAL / single-instance: falls back to an in-memory Map (works in dev and
 *   on a single long-running Node server).
 */
const TTL = 30_000;
const KEY = "presence_online";

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

/* ------------------------------- KV backend ------------------------------- */
async function kvCount(id: string | null): Promise<number | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  const now = Date.now();
  const cmds: (string | number)[][] = [];
  if (id) cmds.push(["ZADD", KEY, now, id]);
  cmds.push(["ZREMRANGEBYSCORE", KEY, 0, now - TTL]); // drop stale sessions
  cmds.push(["ZCARD", KEY]); // count remaining
  try {
    const res = await fetch(`${KV_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const last = Array.isArray(data) ? data[data.length - 1] : null;
    const count = Number(last?.result ?? 0);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return null;
  }
}

/* --------------------------- in-memory fallback --------------------------- */
const g = globalThis as unknown as { __presence?: Map<string, number> };
const store: Map<string, number> = g.__presence ?? (g.__presence = new Map());
function memCount(id: string | null): number {
  const now = Date.now();
  if (id) store.set(id, now);
  for (const [k, ts] of store) if (now - ts > TTL) store.delete(k);
  return Math.max(store.size, id ? 1 : 0);
}

async function getCount(id: string | null): Promise<number> {
  const kv = await kvCount(id);
  return kv ?? memCount(id);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : null;
  return NextResponse.json({ count: await getCount(id) });
}

export async function GET() {
  return NextResponse.json({ count: await getCount(null) });
}
