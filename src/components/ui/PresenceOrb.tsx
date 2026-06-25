"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Floating "online now" orb — heartbeats /api/presence and shows live count. */
export default function PresenceOrb() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
      Math.random().toString(36).slice(2);

    let alive = true;
    const beat = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
          cache: "no-store",
        });
        const data = await res.json();
        if (alive) setCount(data.count ?? 1);
      } catch {
        /* offline — leave last value */
      }
    };

    beat();
    const iv = setInterval(beat, 12000);
    const onVis = () => document.visibilityState === "visible" && beat();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2"
      title={`${count} ${count === 1 ? "operator" : "operators"} online now`}
    >
      <div className="glass flex items-center gap-2 rounded-full border-neon/40 px-3 py-2 shadow-neon-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon" />
        </span>
        <span className="font-mono text-xs text-ink/90">
          <span className="font-bold neon-text">{count}</span>{" "}
          <span className="text-ink/50">online</span>
        </span>
      </div>
    </motion.div>
  );
}
