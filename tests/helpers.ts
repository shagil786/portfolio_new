import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StorageLike } from "@/lib/agent/memory";

export function memStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
  };
}

export { describe, it, expect, vi, beforeEach };
