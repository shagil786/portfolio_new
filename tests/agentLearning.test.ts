import { describe, it, expect } from "vitest";
import {
  recordOutcome,
  loadOutcomes,
  outcomeStats,
  adaptConfidenceFloor,
  loadPolicy,
  savePolicy,
  discoverPatterns,
  type Outcome,
} from "@/lib/agent/learning";
import { BASE_POLICY } from "@/lib/agent/governance";
import { memStorage } from "./helpers";

const outcome = (usedModel: boolean, reason?: string, q = "q"): Outcome => ({
  q, usedModel, fallbackReason: reason, tools: usedModel ? ["get_contact"] : [],
  confidence: usedModel ? 0.9 : null, ts: Date.now(),
});

describe("learning — outcome tracking", () => {
  it("records and windows outcomes", () => {
    const s = memStorage();
    for (let i = 0; i < 70; i++) recordOutcome(outcome(i % 2 === 0), s);
    expect(loadOutcomes(s)).toHaveLength(60);
  });

  it("computes model/fallback rates and dominant reason", () => {
    const s = memStorage();
    for (let i = 0; i < 8; i++) recordOutcome(outcome(true), s);
    for (let i = 0; i < 2; i++) recordOutcome(outcome(false, "low-confidence-or-no-call"), s);
    const stats = outcomeStats(loadOutcomes(s));
    expect(stats.sampleSize).toBe(10);
    expect(stats.modelRate).toBe(0.8);
    expect(stats.dominantFallbackReason).toBe("low-confidence-or-no-call");
  });
});

describe("learning — adaptive policy", () => {
  it("keeps the floor when the sample is too small", () => {
    const policy = { ...BASE_POLICY };
    const next = adaptConfidenceFloor(policy, outcomeStats([outcome(true)]));
    expect(next).toBe(policy.confidenceFloor);
  });

  it("raises the floor when fallbacks dominate", () => {
    const policy = { ...BASE_POLICY };
    const outcomes = Array.from({ length: 10 }, () => outcome(false, "no-tool-call"));
    const next = adaptConfidenceFloor(policy, outcomeStats(outcomes));
    expect(next).toBeGreaterThan(policy.confidenceFloor);
  });

  it("relaxes when the model is consistently grounded", () => {
    const policy = { ...BASE_POLICY, confidenceFloor: 0.4 };
    const outcomes = Array.from({ length: 10 }, () => outcome(true));
    expect(adaptConfidenceFloor(policy, outcomeStats(outcomes))).toBeLessThan(0.4);
  });

  it("never leaves the bounded band around the base", () => {
    const policy = { ...BASE_POLICY, confidenceFloor: 0.59 };
    const outcomes = Array.from({ length: 10 }, () => outcome(false, "no-tool-call"));
    expect(adaptConfidenceFloor(policy, outcomeStats(outcomes))).toBeLessThanOrEqual(0.6);
    const low = { ...BASE_POLICY, confidenceFloor: 0.21 };
    const wins = Array.from({ length: 10 }, () => outcome(true));
    expect(adaptConfidenceFloor(low, outcomeStats(wins))).toBeGreaterThanOrEqual(0.2);
  });

  it("persists and restores only the learned floor", () => {
    const s = memStorage();
    savePolicy({ ...BASE_POLICY, confidenceFloor: 0.45 }, s);
    const restored = loadPolicy(s);
    expect(restored.confidenceFloor).toBe(0.45);
    expect(restored.allowedTools).toEqual(BASE_POLICY.allowedTools);
  });
});

describe("learning — pattern discovery", () => {
  it("finds recurring tokens across fallback questions", () => {
    const eps = [
      { q: "does he know rust?", intent: null, tools: [], confidence: null, usedModel: false, ts: 1 },
      { q: "any rust experience?", intent: null, tools: [], confidence: null, usedModel: false, ts: 2 },
      { q: "rust projects?", intent: null, tools: [], confidence: null, usedModel: false, ts: 3 },
    ];
    expect(discoverPatterns(eps)).toEqual(["rust"]);
  });

  it("returns nothing without repeated fallbacks", () => {
    const eps = [
      { q: "hello", intent: null, tools: [], confidence: null, usedModel: false, ts: 1 },
    ];
    expect(discoverPatterns(eps)).toEqual([]);
  });
});
