import { AGENT_SYSTEM_PROMPT, AGENT_TOOL_SCHEMAS } from "@/lib/agentBrain";

/**
 * Client-side singleton for the on-device MSN AI brain: a Web Worker running
 * the Needle 2 WASM engine. Everything degrades silently — if the worker or
 * the model fails, callers get `null` and fall back to the scripted bot.
 */

export type NeedleStatus = "idle" | "loading" | "ready" | "error";

let worker: Worker | null = null;
let status: NeedleStatus = "idle";
let nextId = 1;
const listeners = new Set<(s: NeedleStatus) => void>();
const pending = new Map<number, (envelope: unknown | null) => void>();

function setStatus(next: NeedleStatus) {
  status = next;
  listeners.forEach((cb) => cb(status));
}

export function getNeedleStatus(): NeedleStatus {
  return status;
}

export function onNeedleStatus(cb: (s: NeedleStatus) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Starts the worker and model load. Safe to call repeatedly and during SSR. */
export function ensureNeedle(): void {
  if (typeof window === "undefined" || worker || status === "error") return;
  setStatus("loading");
  try {
    // Lives inside /needle/ so the emscripten glue (which resolves needle.wasm
    // relative to the worker script — it ignores Module.locateFile) finds it.
    worker = new Worker("/needle/worker.js");
  } catch {
    setStatus("error");
    return;
  }
  worker.onmessage = (event: MessageEvent) => {
    const msg = event.data || {};
    if (msg.type === "status") {
      setStatus(msg.state === "ready" ? "ready" : msg.state === "error" ? "error" : "loading");
      return;
    }
    if (msg.type === "result" && pending.has(msg.id)) {
      pending.get(msg.id)!(msg.error ? null : (msg.envelope ?? null));
      pending.delete(msg.id);
    }
  };
  worker.onerror = () => setStatus("error");
  worker.postMessage({
    type: "init",
    tools: AGENT_TOOL_SCHEMAS,
    system: AGENT_SYSTEM_PROMPT,
  });
}

/**
 * Runs one model turn. Resolves with the Needle envelope (parsed JSON) or
 * null when the engine is not ready, errors, or times out.
 */
export function needleComplete(input: string, timeoutMs = 20000): Promise<unknown | null> {
  if (typeof window === "undefined" || !worker || status !== "ready") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve(null);
    }, timeoutMs);
    pending.set(id, (envelope) => {
      clearTimeout(timer);
      resolve(envelope);
    });
    worker!.postMessage({ type: "complete", id, input });
  });
}
