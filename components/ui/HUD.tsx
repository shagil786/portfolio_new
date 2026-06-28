"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";
import { profile } from "@/data/portfolioData";
import { sfx } from "@/lib/sounds";

function Toggle({
  active,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
        active
          ? "border-neon/60 bg-neon/15 text-neon shadow-neon-sm"
          : "border-white/15 text-ink/60 hover:border-neon/40 hover:text-neon"
      }`}
    >
      {label}
    </button>
  );
}

export default function HUD() {
  const {
    theme,
    cycleTheme,
    muted,
    toggleMute,
    recruiterMode,
    toggleRecruiter,
    lowPower,
    toggleLowPower,
    xp,
    setPaletteOpen,
  } = useGameStore();

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="rounded-md border border-neon/50 bg-black/40 px-2.5 py-1 font-display text-sm font-bold leading-none tracking-wide neon-text">
            {profile.shortName}
          </span>
          <span className="hidden font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink/60 transition-colors group-hover:text-neon sm:inline">
            OS
          </span>
        </Link>

        {/* XP bar */}
        <div className="hidden flex-1 items-center gap-2 px-4 md:flex">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            XP
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-neon/20 bg-black/40">
            <motion.div
              className="h-full bg-gradient-to-r from-neon to-neon2"
              animate={{ width: `${xp}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="w-8 font-mono text-[10px] text-neon">{xp}%</span>
        </div>

        {/* controls */}
        <div className="flex items-center gap-1.5">
          <Toggle
            label={`◑ ${THEMES[theme].label.split(" ")[1]}`}
            title="Cycle theme"
            onClick={() => {
              cycleTheme();
              sfx.blip(muted);
            }}
          />
          <Toggle
            label={muted ? "🔇 mute" : "🔊 sound"}
            active={!muted}
            title="Toggle sound"
            onClick={toggleMute}
          />
          <Toggle
            label="⌘K"
            title="Command palette (Ctrl/Cmd + K)"
            onClick={() => setPaletteOpen(true)}
          />
          <Toggle
            label={lowPower ? "lite 3D" : "full 3D"}
            active={!lowPower}
            title="Toggle reduced 3D mode"
            onClick={toggleLowPower}
          />
          <Toggle
            label="recruiter"
            active={recruiterMode}
            title="Recruiter mode — clean resume"
            onClick={() => {
              toggleRecruiter();
              sfx.blip(muted);
            }}
          />
        </div>
      </div>
    </div>
  );
}
