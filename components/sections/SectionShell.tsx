"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { MissionId } from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

interface SectionShellProps {
  id: MissionId;
  code: string;
  title: string;
  subtitle: string;
  xp?: number;
  children: React.ReactNode;
}

export default function SectionShell({
  id,
  code,
  title,
  subtitle,
  xp = 16,
  children,
}: SectionShellProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: false });
  const unlockMission = useGameStore((s) => s.unlockMission);
  const addXp = useGameStore((s) => s.addXp);
  const setActiveSection = useGameStore((s) => s.setActiveSection);
  const wasUnlocked = useGameStore((s) => s.unlocked[id]);
  const muted = useGameStore((s) => s.muted);

  useEffect(() => {
    if (inView) {
      setActiveSection(id);
      if (!wasUnlocked) {
        unlockMission(id);
        addXp(xp);
        sfx.unlock(muted);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <section
      ref={ref}
      id={id}
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-neon2/80">
            <span className="rounded border border-neon/40 px-2 py-0.5 text-neon">
              MISSION {code}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-neon/50 to-transparent" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-5xl">
            <span className="neon-text">{title}</span>
          </h2>
          <p className="max-w-2xl text-sm text-ink/60 md:text-base">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </section>
  );
}
