import { describe, it, expect, vi, beforeEach } from "vitest";
import { botReply } from "@/lib/botEngine";

vi.mock("@/lib/agentClient", () => ({
  ensureNeedle: vi.fn(),
  needleComplete: vi.fn(),
  getNeedleStatus: vi.fn(() => "ready"),
  onNeedleStatus: vi.fn(() => () => {}),
}));

import { needleComplete } from "@/lib/agentClient";
import { runAgentTurn } from "@/lib/agent/pipeline";

const mockedComplete = vi.mocked(needleComplete);

describe("agent pipeline", () => {
  beforeEach(() => {
    mockedComplete.mockReset();
  });

  it("answers through the model when governance accepts the call", async () => {
    mockedComplete.mockResolvedValue({
      type: "call",
      function_calls: [{ name: "get_contact", arguments: {} }],
      confidence: 0.95,
    });
    const result = await runAgentTurn("how can I contact him?", botReply);
    expect(result.usedModel).toBe(true);
    expect(result.reply).toContain("shagilhmx@gmail.com");
  });

  it("falls back to the scripted bot when the model returns no call", async () => {
    mockedComplete.mockResolvedValue({ type: "respond", function_calls: [], confidence: 0.5 });
    const result = await runAgentTurn("hello", botReply);
    expect(result.usedModel).toBe(false);
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("governance rejects registry-violating calls and falls back", async () => {
    mockedComplete.mockResolvedValue({
      type: "call",
      function_calls: [{ name: "delete_site", arguments: {} }],
      confidence: 0.99,
    });
    const result = await runAgentTurn("destroy everything", botReply);
    expect(result.usedModel).toBe(false);
    expect(result.reply).toBe(botReply("destroy everything"));
  });

  it("falls back safely when the model is unavailable", async () => {
    mockedComplete.mockResolvedValue(null);
    const result = await runAgentTurn("who is shagil?", botReply);
    expect(result.usedModel).toBe(false);
    expect(result.reply).toContain("Software Development Engineer II");
  });

  it("enriches fallback answers with a related graph fact", async () => {
    mockedComplete.mockResolvedValue(null);
    const result = await runAgentTurn("what about finbox?", botReply);
    expect(result.reply).toContain("Related: ");
  });

  it("never throws, even when the model layer rejects", async () => {
    mockedComplete.mockRejectedValue(new Error("engine exploded"));
    const result = await runAgentTurn("anything", botReply);
    expect(result.reply.length).toBeGreaterThan(0);
  });
});
