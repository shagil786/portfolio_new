import { describe, it, expect } from "vitest";
import { handleMcpMessage } from "@/lib/mcpServer";

function rpc(id: number | string, method: string, params?: unknown) {
  return { jsonrpc: "2.0", id, method, params };
}

describe("handleMcpMessage", () => {
  it("responds to initialize with a supported protocol version and server info", () => {
    const res = handleMcpMessage(rpc(1, "initialize", { protocolVersion: "2025-03-26" }));
    expect(res.status).toBe(200);
    const body = res.body as { result: Record<string, unknown> };
    expect(body.result.protocolVersion).toBe("2025-03-26");
    expect(body.result.serverInfo).toMatchObject({ name: "msn-os-portfolio" });
    expect(body.result.capabilities).toHaveProperty("tools");
  });

  it("falls back to the latest protocol version for unknown requests", () => {
    const res = handleMcpMessage(rpc(1, "initialize", { protocolVersion: "1999-01-01" }));
    const body = res.body as { result: { protocolVersion: string } };
    expect(body.result.protocolVersion).toBe("2025-06-18");
  });

  it("accepts notifications with 202 and no body", () => {
    const res = handleMcpMessage({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });
    expect(res.status).toBe(202);
    expect(res.body).toBeNull();
  });

  it("lists tools with names and input schemas", () => {
    const res = handleMcpMessage(rpc(2, "tools/list"));
    const body = res.body as { result: { tools: { name: string; inputSchema: unknown }[] } };
    const names = body.result.tools.map((t) => t.name);
    expect(names).toEqual([
      "get_profile",
      "get_experience",
      "get_projects",
      "get_skills",
      "get_achievements",
      "get_education",
      "get_contact",
    ]);
    for (const tool of body.result.tools) {
      expect(tool.inputSchema).toEqual({ type: "object", properties: {}, required: [] });
    }
  });

  it("returns text content for a known tool call", () => {
    const res = handleMcpMessage(rpc(3, "tools/call", { name: "get_profile" }));
    const body = res.body as { result: { content: { type: string; text: string }[] } };
    expect(body.result.content[0].type).toBe("text");
    expect(body.result.content[0].text).toContain("Md Shagil Nizami");
  });

  it("rejects unknown tools with -32602", () => {
    const res = handleMcpMessage(rpc(4, "tools/call", { name: "nope" }));
    const body = res.body as { error: { code: number } };
    expect(body.error.code).toBe(-32602);
  });

  it("rejects unknown methods with -32601", () => {
    const res = handleMcpMessage(rpc(5, "resources/list"));
    const body = res.body as { error: { code: number } };
    expect(body.error.code).toBe(-32601);
  });

  it("rejects malformed messages with -32600", () => {
    const res = handleMcpMessage({ hello: "world" });
    const body = res.body as { error: { code: number } };
    expect(body.error.code).toBe(-32600);
  });
});
