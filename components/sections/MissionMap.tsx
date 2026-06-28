"use client";

import { motion } from "framer-motion";
import { missions } from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function MissionMap() {
  const unlocked = useGameStore((s) => s.unlocked);
  const muted = useGameStore((s) => s.muted);

  const go = (id: string) => {
    sfx.blip(muted);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
      <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-neon2/80">
        <span className="rounded border border-neon/40 px-2 py-0.5 text-neon">mission map</span>
        <span className="h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {missions.map((m, i) => {
          const isUnlocked = unlocked[m.id];
          return (
            <motion.button
              key={m.id}
              onClick={() => go(m.id)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={`glass group relative overflow-hidden rounded-lg p-3 text-left transition-all ${
                isUnlocked ? "border-neon/50 shadow-neon-sm" : "opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neon2">{m.code}</span>
                <span className={`text-xs ${isUnlocked ? "text-neon" : "text-ink/40"}`}>
                  {isUnlocked ? "●" : "○"}
                </span>
              </div>
              <p className="mt-1 font-display text-sm font-semibold text-ink group-hover:neon-text">
                {m.title}
              </p>
              <p className="text-[10px] text-ink/50">{m.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
