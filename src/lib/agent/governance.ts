import { AGENT_TOOL_SCHEMAS } from "@/lib/agentTools";

/**
 * Governance layer — declared, policy-driven control over the on-device agent.
 *
 * Everything here is static and auditable: the tool registry is the single
 * source of tool truth, every model-proposed call is validated against its
 * schema before execution (defense-in-depth on top of Needle's constrained
 * decoding), and session policy caps runaway usage. Human approval gates are
 * intentionally absent: every tool is read-only over public portfolio data,
 * so the safety net is "answers may only come from validated tool data" —
 * enforced by the brain, not by the model.
 */

export interface AgentPolicy {
  /** Model confidence below this falls back to the scripted bot. */
  confidenceFloor: number;
  /** Hard cap on model turns per browser session. */
  maxTurnsPerSession: number;
  /** Tools the agent may ever execute. */
  allowedTools: string[];
  /** Generation cap per routing turn. */
  maxNewTokens: number;
  /**
   * Whether "action" tools (theme, sound, navigation, recruiter view) may run.
   * Read tools are always allowed; flipping this off mutes the agent's ability
   * to operate the site without touching its ability to answer questions.
   */
  uiActionsAllowed: boolean;
}

export const BASE_POLICY: AgentPolicy = {
  confidenceFloor: 0.35,
  maxTurnsPerSession: 40,
  allowedTools: AGENT_TOOL_SCHEMAS.map((t) => t.name),
  maxNewTokens: 256,
  uiActionsAllowed: true,
};

export interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface Validation {
  valid: boolean;
  reason?: string;
}

/** Registry check: name must exist, args must satisfy the declared schema. */
export function validateToolCall(call: ToolCall): Validation {
  const schema = AGENT_TOOL_SCHEMAS.find((t) => t.name === call.name);
  if (!schema) return { valid: false, reason: `tool not in registry: ${String(call?.name)}` };

  const args = call.arguments ?? {};
  for (const [key, value] of Object.entries(args)) {
    const prop = schema.parameters.properties[key];
    if (!prop) return { valid: false, reason: `unknown argument ${key} for ${call.name}` };
    if (typeof value !== "string") {
      return { valid: false, reason: `argument ${key} must be a string` };
    }
    if (prop.enum && !prop.enum.includes(value)) {
      return { valid: false, reason: `argument ${key}=${value} not in enum` };
    }
  }
  return { valid: true };
}

export function validateEnvelopeToolCalls(
  calls: ToolCall[] | undefined,
  policy: AgentPolicy
): Validation {
  for (const call of calls ?? []) {
    if (!policy.allowedTools.includes(call.name)) {
      return { valid: false, reason: `tool not allowed by policy: ${call.name}` };
    }
    if (
      !policy.uiActionsAllowed &&
      AGENT_TOOL_SCHEMAS.find((t) => t.name === call.name)?.kind === "action"
    ) {
      return { valid: false, reason: `ui actions disabled by policy: ${call.name}` };
    }
    const check = validateToolCall(call);
    if (!check.valid) return check;
  }
  return { valid: true };
}

/** Session turn counter — refuses to run the model past the policy cap. */
export function turnsRemaining(count: number, policy: AgentPolicy): Validation {
  if (count >= policy.maxTurnsPerSession) {
    return { valid: false, reason: "session turn cap reached" };
  }
  return { valid: true };
}
