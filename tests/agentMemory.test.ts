import { describe, it, expect } from "vitest";
import {
  recordEpisode,
  recallContext,
  contextualize,
  loadEpisodes,
  clearEpisodes,
} from "@/lib/agent/memory";
import { memStorage } from "./helpers";

const ep = (q: string, intent: string | null, ts = Date.now()) => ({
  q, intent, tools: intent ? [intent] : [], confidence: 0.9, usedModel: !!intent, ts,
});

describe("episodic memory", () => {
  it("records and recalls an entity-matching episode", () => {
    const s = memStorage();
    recordEpisode(ep("what did he do at finbox?", "get_experience"), s);
    const hint = recallContext("and his projects there?", s);
    expect(hint).toContain("get_experience");
  });

  it("contextualizes the routing query with the hint", () => {
    expect(contextualize("and skills?", "previous topic: get_experience")).toBe(
      "and skills? [context: previous topic: get_experience]"
    );
    expect(contextualize("skills", null)).toBe("skills");
  });

  it("caps memory at 30 episodes", () => {
    const s = memStorage();
    for (let i = 0; i < 40; i++) recordEpisode(ep(`q${i}`, null, i), s);
    expect(loadEpisodes(s)).toHaveLength(30);
    expect(loadEpisodes(s)[0].q).toBe("q10");
  });

  it("survives corrupted storage and missing storage", () => {
    const s = memStorage();
    s.setItem("msn-os-episodes-v1", "{not json");
    expect(loadEpisodes(s)).toEqual([]);
    expect(recallContext("anything", null)).toBeNull();
    expect(() => recordEpisode(ep("q", null), null)).not.toThrow();
  });

  it("clears episodes", () => {
    const s = memStorage();
    recordEpisode(ep("q", null), s);
    clearEpisodes(s);
    expect(loadEpisodes(s)).toEqual([]);
  });
});
