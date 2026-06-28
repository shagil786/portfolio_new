"use client";

import { missions } from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";

export default function MiniMap() {
  const active = useGameStore((s) => s.activeSection);
  const unlocked = useGameStore((s) => s.unlocked);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {missions.map((m) => {
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            onClick={() => document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center justify-end gap-2"
            title={m.title}
          >
            <span
              className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-widest transition-all ${
                isActive ? "text-neon opacity-100" : "text-ink/50 opacity-0 group-hover:opacity-100"
              }`}
            >
              {m.code} {m.title}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full border transition-all ${
                isActive
                  ? "scale-125 border-neon bg-neon shadow-neon-sm"
                  : unlocked[m.id]
                  ? "border-neon/50 bg-neon/30"
                  : "border-white/30 bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
