/**
 * Understanding layer — episodic memory for the on-device MSN AI.
 *
 * The Needle engine has a 256-token sliding window and no persistence, so
 * cross-question memory lives in the visitor's localStorage (ephemeral,
 * private, never sent anywhere). Episodes are compact (intent + tools +
 * confidence) and recalled as short routing hints for follow-up questions
 * like "and skills?".
 */

export interface Episode {
  q: string;
  intent: string | null;
  tools: string[];
  confidence: number | null;
  usedModel: boolean;
  ts: number;
}

const MEMORY_KEY = "msn-os-episodes-v1";
const MAX_EPISODES = 30;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    /* storage unavailable (private mode) */
  }
  return null;
}

export function loadEpisodes(storage: StorageLike | null = defaultStorage()): Episode[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(MEMORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-MAX_EPISODES) : [];
  } catch {
    return [];
  }
}

export function recordEpisode(
  episode: Episode,
  storage: StorageLike | null = defaultStorage()
): void {
  if (!storage) return;
  try {
    const next = [...loadEpisodes(storage), episode].slice(-MAX_EPISODES);
    storage.setItem(MEMORY_KEY, JSON.stringify(next));
  } catch {
    /* quota or serialization failure — memory is best-effort */
  }
}

export function clearEpisodes(storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.removeItem(MEMORY_KEY);
  } catch {
    /* ignore */
  }
}

/** Entities worth remembering across questions (employers on the resume). */
const ENTITY_HINTS = ["yahoo", "finbox", "fincity"];

function entityIn(q: string): string | null {
  const lower = q.toLowerCase();
  return ENTITY_HINTS.find((e) => lower.includes(e)) ?? null;
}

/**
 * Recall a short routing hint from episodic memory: the most recent episode
 * that shares an entity (or, for pronoun-style follow-ups, the last episode
 * at all). Returns null when nothing is relevant.
 */
export function recallContext(
  q: string,
  storage: StorageLike | null = defaultStorage()
): string | null {
  const episodes = loadEpisodes(storage);
  if (episodes.length === 0) return null;

  const entity = entityIn(q);
  const pronounish = /\b(he|his|him|that|it|more|also|and)\b/i.test(q);
  const match = [...episodes]
    .reverse()
    .find(
      (e) =>
        e.intent &&
        (entityIn(e.q) === entity || (pronounish && !entity))
    );
  if (!match?.intent) return null;

  return `previous topic: ${match.intent}`;
}

/** Builds the string actually sent to the routing model. */
export function contextualize(q: string, hint: string | null): string {
  return hint ? `${q} [context: ${hint}]` : q;
}
