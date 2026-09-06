/* global self */
/**
 * MSN AI on-device brain worker.
 *
 * Runs the Needle 2 tool-calling model entirely in the browser:
 *   /needle/needle.js (emscripten glue) + needle.wasm (334KB engine)
 *   + /needle/needle2.cact (13.7MB weights, cached by the browser).
 *
 * Protocol (postMessage):
 *   in:  { type: "init" }
 *   in:  { type: "complete", id, input }
 *   out: { type: "status", state: "loading" | "ready" | "error", message? }
 *   out: { type: "result", id, envelope? , error? }
 *
 * Any failure here is non-fatal: the main thread falls back to the scripted
 * bot, so the chat works with or without the model.
 */

const NEEDLE_DIR = "/needle";
// The real system prompt is posted with the init message (single source of
// truth lives in src/lib/agentBrain.ts); this is only a safety default.
const SYSTEM_PROMPT = "";
// A LoRA-tuned model can be dropped in as /needle/tuned.cact to activate it;
// otherwise the base needle2.cact is used. (Fine-tuned weights report
// uncalibrated confidence — the pipeline treats missing confidence as
// pass-through, see agentBrain.)
const BASE_WEIGHTS = "/needle/needle2.cact";

let modulePromise = null;
let ready = false;
let chain = Promise.resolve();

function status(state, message) {
  self.postMessage({ type: "status", state, message });
}

async function loadEngine(toolsJson, systemPrompt) {
  status("loading", "fetching on-device model…");

  // needle.js is a UMD emscripten module; importScripts would not expose it
  // in a worker, so evaluate it with shims and keep the factory.
  const src = await (await fetch(`${NEEDLE_DIR}/needle.js`)).text();
  const shim = { exports: {} };
  new Function("module", "exports", "define", src)(shim, shim.exports, undefined);
  const createNeedle = shim.exports.default || shim.exports;

  const Module = await createNeedle({
    locateFile: (p) => `${NEEDLE_DIR}/${p}`,
    print: () => {},
    printErr: () => {},
  });

  let weightsRes = await fetch(`${NEEDLE_DIR}/tuned.cact`);
  if (!weightsRes.ok) weightsRes = await fetch(BASE_WEIGHTS);
  if (!weightsRes.ok) throw new Error(`weights fetch failed: ${weightsRes.status}`);
  const weights = new Uint8Array(await weightsRes.arrayBuffer());

  const ptr = Module._malloc(weights.length);
  new Uint8Array(Module.HEAPU8.buffer, ptr, weights.length).set(weights);
  const rcLoad = Module._needle_load(ptr, BigInt(weights.length));
  Module._free(ptr);
  if (rcLoad < 0) throw new Error(`needle_load failed (${rcLoad})`);

  const rcInit = Module.ccall(
    "needle_init", "number",
    ["string", "string", "string"],
    [systemPrompt, toolsJson, null]
  );
  if (rcInit < 0) throw new Error(`needle_init failed (${rcInit})`);

  return Module;
}

function complete(Module, input) {
  const outCap = 4096;
  const outPtr = Module._malloc(outCap);
  try {
    const rc = Module.ccall(
      "needle_complete", "number",
      ["string", "number", "number", "number"],
      [input, 256, outPtr, outCap]
    );
    if (rc < 0) throw new Error(`needle_complete failed (${rc})`);
    const bytes = new Uint8Array(Module.HEAPU8.buffer, outPtr, outCap);
    const text = new TextDecoder().decode(bytes.slice(0, bytes.indexOf(0)));
    return JSON.parse(text);
  } finally {
    Module._free(outPtr);
  }
}

self.onmessage = (event) => {
  const msg = event.data || {};

  if (msg.type === "init") {
    if (ready) {
      status("ready");
      return;
    }
    if (modulePromise) return;
    const toolsJson = JSON.stringify(msg.tools || []);
    modulePromise = loadEngine(toolsJson, String(msg.system ?? SYSTEM_PROMPT))
      .then((m) => {
        self.__module = m;
        ready = true;
        status("ready");
      })
      .catch((err) => {
        status("error", String(err && err.message ? err.message : err));
      });
    return;
  }

  if (msg.type === "complete") {
    if (!ready || !self.__module) {
      self.postMessage({ type: "result", id: msg.id, error: "engine-not-ready" });
      return;
    }
    // Serialize model calls — the engine holds a single conversation buffer.
    chain = chain
      .then(() => {
        const envelope = complete(self.__module, String(msg.input || ""));
        self.postMessage({ type: "result", id: msg.id, envelope });
      })
      .catch((err) => {
        self.postMessage({
          type: "result",
          id: msg.id,
          error: String(err && err.message ? err.message : err),
        });
      });
  }
};
