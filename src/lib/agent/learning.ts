import { loadEpisodes, type Episode } from "@/lib/agent/memory";
import { BASE_POLICY, type AgentPolicy } from "@/lib/agent/governance";

/**
 * Learning layer — outcome tracking and light self-improvement, all
 * visitor-local (localStorage), nothing leaves the browser.
 *
 * - Outcome tracking: every turn records whether the model answered or the
 *   scripted fallback fired, and why.
 * - Policy mutation: the confidence floor drifts up when fallbacks dominate
 *   (the model is guessing too often) and relaxes back when the model is
 *   consistently grounded — a conservative, bounded feedback loop.
 * - Pattern discovery: recurring fallback questions become surfaced patterns,
 *   the seeds for future fine-tuning data.
 */

export interface Outcome {
  q: string;
  usedModel: boolean;
  fallbackReason?: string;
  tools: string[];
  confidence: number | null;
  ts: number;
}

const OUTCOMES_KEY = "msn-os-outcomes-v1";
const POLICY_KEY = "msn-os-policy-v1";
const MAX_OUTCOMES = 60;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    /* unavailable */
  }
  return null;
}

export function loadOutcomes(storage: StorageLike | null = defaultStorage()): Outcome[] {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(OUTCOMES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(-MAX_OUTCOMES) : [];
  } catch {
    return [];
  }
}

export function recordOutcome(
  outcome: Outcome,
  storage: StorageLike | null = defaultStorage()
): void {
  if (!storage) return;
  try {
    const next = [...loadOutcomes(storage), outcome].slice(-MAX_OUTCOMES);
    storage.setItem(OUTCOMES_KEY, JSON.stringify(next));
  } catch {
    /* best-effort */
  }
}

export interface OutcomeStats {
  sampleSize: number;
  modelRate: number;
  fallbackRate: number;
  dominantFallbackReason: string | null;
}

export function outcomeStats(outcomes: Outcome[], windowSize = 10): OutcomeStats {
  const recent = outcomes.slice(-windowSize);
  if (recent.length === 0) {
    return { sampleSize: 0, modelRate: 0, fallbackRate: 0, dominantFallbackReason: null };
  }
  const modelTurns = recent.filter((o) => o.usedModel);
  const fallbacks = recent.filter((o) => !o.usedModel);
  const reasonCounts = new Map<string, number>();
  for (const f of fallbacks) {
    const key = f.fallbackReason ?? "unknown";
    reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
  }
  const dominant = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    sampleSize: recent.length,
    modelRate: modelTurns.length / recent.length,
    fallbackRate: fallbacks.length / recent.length,
    dominantFallbackReason: dominant ? dominant[0] : null,
  };
}

/** Adaptive floor, bounded: the loop can move the base ±0.15, never past 0.6. */
export function adaptConfidenceFloor(policy: AgentPolicy, stats: OutcomeStats): number {
  const base = BASE_POLICY.confidenceFloor;
  if (stats.sampleSize < 5) return policy.confidenceFloor;
  let floor = policy.confidenceFloor;
  if (stats.fallbackRate > 0.6) floor += 0.05;
  else if (stats.modelRate > 0.8) floor -= 0.05;
  return Math.round(
    Math.min(0.6, Math.max(base - 0.15, Math.min(floor, base + 0.15))) * 100
  ) / 100;
}

export function loadPolicy(storage: StorageLike | null = defaultStorage()): AgentPolicy {
  if (!storage) return { ...BASE_POLICY };
  try {
    const stored = JSON.parse(storage.getItem(POLICY_KEY) ?? "null");
    // BASE_POLICY stays authoritative for structure; only the learned floor
    // is restored, bounded by adaptConfidenceFloor's limits.
    if (stored && typeof stored.confidenceFloor === "number") {
      return { ...BASE_POLICY, confidenceFloor: stored.confidenceFloor };
    }
  } catch {
    /* corrupted → defaults */
  }
  return { ...BASE_POLICY };
}

export function savePolicy(
  policy: AgentPolicy,
  storage: StorageLike | null = defaultStorage()
): void {
  try {
    storage?.setItem(POLICY_KEY, JSON.stringify(policy));
  } catch {
    /* best-effort */
  }
}

/** Naive pattern discovery: recurring content words across fallback questions. */
export function discoverPatterns(episodes: Episode[], limit = 3): string[] {
  const fallbackQuestions = episodes.filter((e) => !e.usedModel).map((e) => e.q.toLowerCase());
  if (fallbackQuestions.length < 2) return [];
  const stop = new Set([
    "the", "a", "an", "is", "of", "at", "to", "he", "his", "him", "did", "do",
    "what", "how", "who", "and", "in", "for", "on", "with", "i", "me", "my",
  ]);
  const counts = new Map<string, number>();
  for (const q of fallbackQuestions) {
    for (const token of q.split(/[^a-z0-9+]+/)) {
      if (token.length < 3 || stop.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}
