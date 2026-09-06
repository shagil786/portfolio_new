import { describe, it, expect } from "vitest";
import {
  validateToolCall,
  validateEnvelopeToolCalls,
  turnsRemaining,
  BASE_POLICY,
} from "@/lib/agent/governance";

describe("governance — tool registry validation", () => {
  it("accepts a registered tool with valid enum arguments", () => {
    expect(validateToolCall({ name: "get_experience", arguments: { company: "Finbox" } })).toEqual({
      valid: true,
    });
  });

  it("rejects tools outside the registry", () => {
    expect(validateToolCall({ name: "launch_missiles" }).valid).toBe(false);
  });

  it("rejects unknown arguments", () => {
    expect(validateToolCall({ name: "get_contact", arguments: { phone: "x" } }).valid).toBe(false);
  });

  it("rejects enum violations even though decoding is grammar-constrained", () => {
    const check = validateToolCall({ name: "get_projects", arguments: { category: "Space" } });
    expect(check.valid).toBe(false);
    expect(check.reason).toContain("enum");
  });

  it("rejects non-string argument values", () => {
    expect(validateToolCall({ name: "get_experience", arguments: { company: 42 } }).valid).toBe(false);
  });
});

describe("governance — policy", () => {
  it("enforces the allowlist over the registry", () => {
    const policy = { ...BASE_POLICY, allowedTools: ["get_profile"] };
    expect(validateEnvelopeToolCalls([{ name: "get_contact" }], policy).valid).toBe(false);
    expect(validateEnvelopeToolCalls([{ name: "get_profile" }], policy).valid).toBe(true);
  });

  it("passes through turns with no calls", () => {
    expect(validateEnvelopeToolCalls([], BASE_POLICY).valid).toBe(true);
    expect(validateEnvelopeToolCalls(undefined, BASE_POLICY).valid).toBe(true);
  });

  it("stops the session at the policy cap", () => {
    expect(turnsRemaining(BASE_POLICY.maxTurnsPerSession, BASE_POLICY).valid).toBe(false);
    expect(turnsRemaining(0, BASE_POLICY).valid).toBe(true);
  });
});
