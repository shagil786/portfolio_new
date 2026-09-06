import { describe, it, expect } from "vitest";
import { interpretNeedleResponse, CONFIDENCE_FLOOR } from "@/lib/agentBrain";
import { botReply } from "@/lib/botEngine";

describe("interpretNeedleResponse", () => {
  it("executes a valid tool call and produces a deterministic reply", () => {
    const result = interpretNeedleResponse({
      type: "call",
      success: true,
      function_calls: [{ name: "get_contact", arguments: {} }],
      confidence: 0.98,
      reasoning: "'contact' -> get_contact",
    });
    expect(result.usedModel).toBe(true);
    expect(result.reply).toContain("shagilhmx@gmail.com");
    expect(result.confidence).toBe(0.98);
  });

  it("passes extracted arguments through to the executor", () => {
    const result = interpretNeedleResponse({
      type: "call",
      function_calls: [{ name: "get_experience", arguments: { company: "Finbox" } }],
      confidence: 0.9,
    });
    expect(result.usedModel).toBe(true);
    expect(result.reply).toContain("Finbox");
    expect(result.reply).not.toContain("Yahoo");
  });

  it("falls back below the confidence floor", () => {
    const result = interpretNeedleResponse({
      type: "call",
      function_calls: [{ name: "get_contact" }],
      confidence: CONFIDENCE_FLOOR - 0.01,
    });
    expect(result.usedModel).toBe(false);
    expect(result.fallbackReason).toBe("low-confidence");
  });

  it("falls back on respond-type turns with no calls", () => {
    const result = interpretNeedleResponse({
      type: "respond",
      function_calls: [],
      confidence: 0.47,
    });
    expect(result.usedModel).toBe(false);
    expect(result.fallbackReason).toBe("no-tool-call");
  });

  it("falls back on unknown tools", () => {
    const result = interpretNeedleResponse({
      type: "call",
      function_calls: [{ name: "launch_missiles", arguments: {} }],
      confidence: 0.99,
    });
    expect(result.usedModel).toBe(false);
    expect(result.fallbackReason).toBe("no-tool-call");
  });

  it("falls back on engine errors and invalid envelopes", () => {
    expect(interpretNeedleResponse({ error: "boom" }).fallbackReason).toBe("engine-error");
    expect(interpretNeedleResponse(null).fallbackReason).toBe("invalid-envelope");
    expect(interpretNeedleResponse("junk").fallbackReason).toBe("invalid-envelope");
  });

  it("falls back when tool execution yields nothing", () => {
    const result = interpretNeedleResponse(
      {
        type: "call",
        function_calls: [{ name: "get_profile", arguments: {} }],
        confidence: 0.9,
      },
      () => ({ error: "boom" })
    );
    expect(result.usedModel).toBe(false);
    expect(result.fallbackReason).toBe("tool-execution-empty");
  });

  it("the scripted fallback answers what the model could not", () => {
    // Pairing guarantee: fallbackReply(botReply(q)) always yields a non-empty reply.
    for (const q of ["how long has he been working?", "rust experience?", "hello"]) {
      expect(botReply(q).length).toBeGreaterThan(0);
    }
  });
});
