"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { experiences } from "@/data/portfolioData";
import SectionShell from "./SectionShell";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function Experience() {
  const [open, setOpen] = useState<string | null>("yahoo");
  const muted = useGameStore((s) => s.muted);

  // ordered highest level first
  const ordered = [...experiences].sort((a, b) => b.level - a.level);

  return (
    <SectionShell
      id="experience"
      code="02"
      title="Experience"
      subtitle="Career mission logs — each role is a cleared level."
    >
      <div className="relative space-y-5 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-neon/60 before:via-neon/20 before:to-transparent md:before:left-[26px]">
        {ordered.map((exp, i) => {
          const isOpen = open === exp.id;
          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
              className="relative pl-12 md:pl-16"
            >
              {/* node */}
              <div className="absolute left-0 top-1 grid h-9 w-9 place-items-center rounded-full border border-neon/50 bg-black/60 font-mono text-xs font-bold neon-text md:h-[52px] md:w-[52px] md:text-sm">
                L{exp.level}
              </div>

              <div className="glass overflow-hidden rounded-xl">
                <button
                  onClick={() => {
                    sfx.blip(muted);
                    setOpen(isOpen ? null : exp.id);
                  }}
                  className="flex w-full flex-col gap-2 p-4 text-left md:p-5"
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neon2">
                        {exp.theme}
                      </span>
                      <h3 className="font-display text-lg font-bold text-ink md:text-xl">
                        {exp.role} · <span className="neon-text">{exp.company}</span>
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-ink/50">{exp.date}</span>
                  </div>
                  <p className="text-sm text-ink/65">{exp.summary}</p>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {exp.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded border border-neon/30 bg-neon/10 px-2 py-0.5 text-[10px] font-medium text-neon"
                      >
                        ◈ {b}
                      </span>
                    ))}
                  </div>

                  <span className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neon2/80">
                    {isOpen ? "▾ close mission log" : "▸ open mission log"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-4 md:p-5">
                        <ul className="space-y-2">
                          {exp.highlights.map((h, hi) => (
                            <li key={hi} className="flex gap-2 text-sm text-ink/80">
                              <span className="mt-1 text-neon">▹</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {exp.stack.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-neon2/30 bg-black/30 px-2.5 py-0.5 text-[11px] text-neon2"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
