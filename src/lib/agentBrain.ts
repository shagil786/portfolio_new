import { AGENT_TOOL_SCHEMAS, executeTool, formatToolData } from "@/lib/agentTools";
import { QUICK_REPLIES } from "@/lib/botEngine";

/**
 * Decision layer between the on-device Needle 2 model and the chat UI.
 *
 * Needle returns a grammar-constrained JSON envelope:
 *   { type: "call" | "respond", function_calls: [{name, arguments}],
 *     confidence, reasoning, ... }
 *
 * The model only routes intent and extracts entities — every visitor-visible
 * answer is produced by deterministic code from portfolioData. If the model is
 * unavailable, unsure, or calls an unknown tool, we fall back to the scripted
 * bot so the chat never breaks.
 */

export interface NeedleToolCall {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface NeedleEnvelope {
  type?: string;
  success?: boolean;
  function_calls?: NeedleToolCall[];
  confidence?: number;
  reasoning?: string | null;
  error?: string | null;
  error_code?: number | null;
}

/** Below this the model is guessing — the scripted bot is more trustworthy. */
export const CONFIDENCE_FLOOR = 0.35;

/**
 * Few-shot routing examples baked into the on-device model's system prompt.
 * The 45M model routes intent largely off these patterns, so keep them in sync
 * with AGENT_TOOL_SCHEMAS.
 */
export const AGENT_SYSTEM_PROMPT =
  "You are MSN AI, the assistant on the portfolio website of Md Shagil Nizami. " +
  "Map each visitor question to the matching tool and arguments. " +
  "If no tool matches the question, respond without a function call. " +
  "Examples: 'what did he do at Finbox' -> get_experience(company=\"Finbox\"); " +
  "'show me his projects' -> get_projects(); 'how do I contact him' -> get_contact(); " +
  "'who is he' -> get_profile(); 'what tech does he know' -> get_skills(); " +
  "'where did he study' -> get_education(); 'what impact did he have' -> get_achievements().";

export type ToolExecutor = (name: string, args: Record<string, unknown>) => unknown;

export function defaultToolExecutor(name: string, args: Record<string, unknown>): unknown {
  return executeTool(name, args);
}

export interface BrainResult {
  reply: string;
  usedModel: boolean;
  toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
  confidence: number | null;
  fallbackReason?: string;
}

export function interpretNeedleResponse(
  envelope: unknown,
  executor: ToolExecutor = defaultToolExecutor
): BrainResult {
  const fallback = (reason: string): BrainResult => ({
    reply: "",
    usedModel: false,
    toolCalls: [],
    confidence: null,
    fallbackReason: reason,
  });

  if (typeof envelope !== "object" || envelope === null) {
    return fallback("invalid-envelope");
  }
  const e = envelope as NeedleEnvelope;
  if (e.error || e.error_code !== null && e.error_code !== undefined && e.error_code !== 0) {
    return fallback("engine-error");
  }

  const confidence = typeof e.confidence === "number" ? e.confidence : null;
  if (confidence !== null && confidence < CONFIDENCE_FLOOR) {
    return fallback("low-confidence");
  }

  const calls = Array.isArray(e.function_calls) ? e.function_calls : [];
  const valid = calls.filter(
    (c) =>
      typeof c?.name === "string" &&
      AGENT_TOOL_SCHEMAS.some((t) => t.name === c.name)
  );
  if (e.type !== "call" || valid.length === 0) {
    return fallback("no-tool-call");
  }

  const sections: string[] = [];
  for (const call of valid) {
    const data = executor(call.name, call.arguments ?? {});
    const text = formatToolData(call.name, data);
    if (text) sections.push(text);
  }
  if (sections.length === 0) {
    return fallback("tool-execution-empty");
  }

  return {
    reply: sections.join("\n\n"),
    usedModel: true,
    toolCalls: valid.map((c) => ({ name: c.name, arguments: c.arguments ?? {} })),
    confidence,
  };
}

/** Reply used when Needle is unavailable or not confident enough. */
export function fallbackReply(scriptedReply: string): BrainResult {
  return { reply: scriptedReply, usedModel: false, toolCalls: [], confidence: null };
}

export { AGENT_TOOL_SCHEMAS, QUICK_REPLIES };
