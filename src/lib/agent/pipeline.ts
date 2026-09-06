import { contextualize, recallContext, recordEpisode } from "@/lib/agent/memory";
import {
  loadPolicy,
  recordOutcome,
  savePolicy,
  outcomeStats,
  adaptConfidenceFloor,
  loadOutcomes,
} from "@/lib/agent/learning";
import {
  turnsRemaining,
  validateEnvelopeToolCalls,
  type AgentPolicy,
} from "@/lib/agent/governance";
import { relatedLine } from "@/lib/agent/graph";
import { matchActionIntent } from "@/lib/agent/actions";
import { needleComplete, ensureNeedle } from "@/lib/agentClient";
import { executeTool, formatToolData } from "@/lib/agentTools";
import { interpretNeedleResponse } from "@/lib/agentBrain";

/**
 * The full pipeline — a deliberately small agentic loop:
 *
 *   understanding (memory recall → contextualized query)
 *     → governance (policy + registry validation)
 *     → execution (validated tools over portfolio data, graph enrichment)
 *     → learning (outcome recorded → adaptive confidence floor)
 *
 * Every stage degrades gracefully: if the model is unavailable or untrusted,
 * the deterministic scripted bot answers instead. The caller (MSNBot) only
 * sees a reply string.
 */

export interface AgentAnswer {
  reply: string;
  usedModel: boolean;
  policy: AgentPolicy;
}

/** Session-scoped turn counter (per tab), backing the governance cap. */
function sessionTurnCount(): number {
  try {
    return Number(sessionStorage.getItem("msn-os-turns") ?? "0");
  } catch {
    return 0;
  }
}

function bumpSessionTurns(): void {
  try {
    sessionStorage.setItem("msn-os-turns", String(sessionTurnCount() + 1));
  } catch {
    /* unavailable */
  }
}

export function modelAnswer(
  envelope: unknown,
  policy: AgentPolicy
): { reply: string; tools: string[]; confidence: number | null } | null {
  const result = interpretNeedleResponse(envelope, (name, args) => {
    // Governance sits between the model and execution: registry + schema
    // validation happens per call before any tool runs.
    const check = validateEnvelopeToolCalls([{ name, arguments: args }], policy);
    if (!check.valid) return { error: `governance: ${check.reason}` };
    return executeTool(name, args);
  });
  if (!result.usedModel) return null;
  return { reply: result.reply, tools: result.toolCalls.map((t) => t.name), confidence: result.confidence };
}

/**
 * Answers one visitor question through the layered pipeline.
 * `scripted` is the deterministic fallback (botEngine.botReply).
 */
export async function runAgentTurn(
  q: string,
  scripted: (question: string) => string,
  now: number = Date.now()
): Promise<AgentAnswer> {
  let policy = loadPolicy();

  // GOVERNANCE — session caps and the learned confidence floor.
  const stats = outcomeStats(loadOutcomes());
  policy = { ...policy, confidenceFloor: adaptConfidenceFloor(policy, stats) };
  savePolicy(policy);

  const turnLimit = turnsRemaining(sessionTurnCount(), policy);

  // UNDERSTANDING — episodic memory shapes the routing query.
  const hint = recallContext(q);
  const routingQuery = contextualize(q, hint);

  // EXECUTION — model proposes, governance validates, tools answer.
  let usedModel = false;
  let reply = "";
  let tools: string[] = [];
  let confidence: number | null = null;
  let fallbackReason: string | undefined;

  if (turnLimit.valid) {
    ensureNeedle();
    try {
      const envelope = await needleComplete(routingQuery);
      if (envelope) {
        const answer = modelAnswer(envelope, policy);
        if (answer) {
          usedModel = true;
          reply = answer.reply;
          tools = answer.tools;
          confidence = answer.confidence;
        } else {
          fallbackReason = "low-confidence-or-no-call";
        }
      } else {
        fallbackReason = "model-unavailable";
      }
    } catch {
      fallbackReason = "model-error";
    }
  } else {
    fallbackReason = turnLimit.reason;
  }

  if (!usedModel) {
    // Second fallback stage — deterministic action matcher catches obvious
    // UI operations ("make it purple", "mute") the small model missed.
    const actionReply = matchActionIntent(q);
    if (actionReply) {
      reply = actionReply;
      tools = ["action:scripted"];
    } else {
      const scriptedReply = scripted(q);
      // GRAPH enrichment — add one related fact line when the data has one.
      const extra = relatedLine(q);
      reply = extra ? `${scriptedReply}\n\n${extra}` : scriptedReply;
    }
  }

  // LEARNING — record the outcome and let it mutate policy next turn.
  bumpSessionTurns();
  recordEpisode({
    q,
    intent: tools[0] ?? null,
    tools,
    confidence,
    usedModel,
    ts: now,
  });
  recordOutcome({ q, usedModel, fallbackReason, tools, confidence, ts: now });

  return { reply, usedModel, policy };
}
