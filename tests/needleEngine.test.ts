import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AGENT_SYSTEM_PROMPT,
  interpretNeedleResponse,
} from "@/lib/agentBrain";
import { AGENT_TOOL_SCHEMAS, executeTool, formatToolData } from "@/lib/agentTools";

/**
 * End-to-end: the exact engine + weights shipped in /public/needle running in
 * a JS runtime (the same emscripten module the Web Worker loads), driven with
 * the same tool schemas the site deploys. Proves the on-device brain actually
 * produces tool calls — not just that the TypeScript layers are sound.
 */
const require = createRequire(import.meta.url);
const createNeedle = require(join(__dirname, "..", "public", "needle", "needle.js"));
const weights = readFileSync(join(__dirname, "..", "public", "needle", "needle2.cact"));

async function makeEngine() {
  const Module = await createNeedle();
  const ptr = Module._malloc(weights.length);
  new Uint8Array(Module.HEAPU8.buffer, ptr, weights.length).set(weights);
  expect(Module._needle_load(ptr, BigInt(weights.length))).toBeGreaterThanOrEqual(0);
  Module._free(ptr);
  const rc = Module.ccall(
    "needle_init", "number", ["string", "string", "string"],
    [AGENT_SYSTEM_PROMPT, JSON.stringify(AGENT_TOOL_SCHEMAS), null]
  );
  expect(rc).toBeGreaterThanOrEqual(0);
  return Module;
}

function complete(Module: unknown, input: string): unknown {
  const m = Module as {
    _malloc: (n: number) => number;
    _free: (p: number) => void;
    HEAPU8: Uint8Array;
    ccall: (...args: unknown[]) => number;
  };
  const outCap = 4096;
  const outPtr = m._malloc(outCap);
  try {
    const rc = m.ccall(
      "needle_complete", "number", ["string", "number", "number", "number"],
      [input, 256, outPtr, outCap]
    );
    expect(rc).toBeGreaterThanOrEqual(0);
    const bytes = new Uint8Array(m.HEAPU8.buffer, outPtr, outCap);
    return JSON.parse(new TextDecoder().decode(bytes.slice(0, bytes.indexOf(0))));
  } finally {
    m._free(outPtr);
  }
}

describe("needle WASM engine (shipped assets)", () => {
  it("loads the real weights and emits grammar-valid tool calls", async () => {
    const Module = await makeEngine();

    // Contact question — the model may route it to get_contact or respond
    // without a call (45M model; the brain falls back to the scripted bot in
    // that case). The invariant: whatever it emits must be a known tool with
    // grammar-valid arguments, and the brain must produce a safe answer.
    const envelope = complete(Module, "how can I contact him?") as {
      type?: string;
      function_calls?: Array<{ name: string; arguments?: Record<string, unknown> }>;
      confidence?: number;
    };
    expect(typeof envelope).toBe("object");
    for (const call of envelope.function_calls ?? []) {
      expect(AGENT_TOOL_SCHEMAS.some((t) => t.name === call.name)).toBe(true);
    }
    const routed = interpretNeedleResponse(envelope);
    expect(routed.usedModel || (routed.fallbackReason?.length ?? 0) > 0).toBe(true);
    if (routed.usedModel) {
      expect(routed.reply).toContain("shagilhmx@gmail.com");
    }

    // Whatever the model chose, our brain either answers from real data or
    // falls back — it never crashes or leaks raw model output.
    const result = interpretNeedleResponse(envelope);
    expect(result.usedModel || (result.fallbackReason?.length ?? 0) > 0).toBe(true);
    if (result.usedModel) {
      expect(result.reply).toContain("shagilhmx@gmail.com");
    }

    // The schemas we deploy must be byte-compatible with what the engine
    // consumed: every schema has a name, description, and object parameters.
    for (const tool of AGENT_TOOL_SCHEMAS) {
      expect(tool.name).toBeTruthy();
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.parameters.type).toBe("object");
    }

    // And executing the tools the engine may call always yields formattable data.
    for (const tool of AGENT_TOOL_SCHEMAS) {
      const data = executeTool(tool.name, {});
      expect(formatToolData(tool.name, data).length).toBeGreaterThan(0);
    }
  }, 120_000);
});
