"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { achievements } from "@/data/portfolioData";
import SectionShell from "./SectionShell";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function Achievements() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const muted = useGameStore((s) => s.muted);

  return (
    <SectionShell
      id="achievements"
      code="05"
      title="Achievements"
      subtitle="Unlocked records — verified impact across the missions."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {achievements.map((a, i) => (
          <AchievementBadge
            key={a.id}
            index={i}
            achievement={a}
            unlocked={unlockedAchievements.includes(a.id)}
            onUnlock={() => {
              unlockAchievement(a.id);
              sfx.achievement(muted);
            }}
          />
        ))}
      </div>
    </SectionShell>
  );
}

function AchievementBadge({
  achievement,
  index,
  unlocked,
  onUnlock,
}: {
  achievement: (typeof achievements)[number];
  index: number;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  // auto-unlock when the badge scrolls into view (staggered)
  useEffect(() => {
    if (!unlocked) {
      const t = setTimeout(onUnlock, 300 + index * 180);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 16 }}
      className={`glass relative flex flex-col items-center gap-2 overflow-hidden rounded-xl p-4 text-center transition ${
        unlocked ? "border-neon/50 shadow-neon-sm" : "opacity-60 grayscale"
      }`}
    >
      {unlocked && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgb(var(--neon)/0.5), transparent 60%)",
          }}
        />
      )}
      <span className="text-3xl">{achievement.icon}</span>
      <p className="font-display text-xs font-bold text-ink">{achievement.title}</p>
      <p className="text-[10px] leading-tight text-ink/50">{achievement.detail}</p>
      <span className="font-mono text-[9px] uppercase tracking-widest text-neon">
        {unlocked ? "● unlocked" : "○ locked"}
      </span>
    </motion.div>
  );
}
