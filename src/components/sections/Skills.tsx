"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillCategories } from "@/data/portfolioData";
import SectionShell from "./SectionShell";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function Skills() {
  const [active, setActive] = useState(skillCategories[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  const muted = useGameStore((s) => s.muted);
  const current = skillCategories.find((c) => c.id === active)!;

  return (
    <SectionShell
      id="skills"
      code="03"
      title="Skills Arsenal"
      subtitle="Inventory of weapons & tools. Select a category to open its holo-panel."
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* category selector */}
        <div className="flex flex-row flex-wrap gap-2 lg:flex-col">
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sfx.blip(muted);
                setActive(cat.id);
              }}
              className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                active === cat.id
                  ? "border-neon/60 bg-neon/10 shadow-neon-sm"
                  : "border-white/10 bg-black/20 hover:border-neon/30"
              }`}
            >
              <span className="font-mono text-lg neon-text">{cat.icon}</span>
              <span className="font-display text-sm font-semibold text-ink">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* holographic panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14, rotateX: -6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="glass-strong relative overflow-hidden rounded-2xl p-5 md:p-6"
          >
            <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-neon to-transparent" />
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neon2/80">
              // {current.label.toLowerCase()}_module.sys
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {current.skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseEnter={() => setHovered(skill.name)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-lg border border-white/10 bg-black/30 p-3 transition hover:border-neon/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-ink">{skill.name}</span>
                    <span className="font-mono text-[10px] text-neon2">
                      {skill.power}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-neon shadow-neon-sm"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.power}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.04 }}
                    />
                  </div>
                  <AnimatePresence>
                    {hovered === skill.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-[11px] leading-snug text-ink/60"
                      >
                        {skill.blurb}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}
