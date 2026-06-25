"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/portfolioData";
import SectionShell from "./SectionShell";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

function DeployButton() {
  const [state, setState] = useState<"idle" | "deploying" | "done">("idle");
  const muted = useGameStore((s) => s.muted);
  const run = () => {
    if (state !== "idle") return;
    sfx.blip(muted);
    setState("deploying");
    setTimeout(() => {
      setState("done");
      sfx.unlock(muted);
      setTimeout(() => setState("idle"), 2200);
    }, 1400);
  };
  return (
    <button
      onClick={run}
      className="mt-3 w-full overflow-hidden rounded-md border border-neon/40 bg-black/30 py-2 font-mono text-[11px] uppercase tracking-widest text-neon transition hover:bg-neon/10"
    >
      {state === "idle" && "▸ deploy simulation"}
      {state === "deploying" && (
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-ping rounded-full bg-neon" />
          deploying…
        </span>
      )}
      {state === "done" && "✓ deployed to prod"}
    </button>
  );
}

export default function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);
  const muted = useGameStore((s) => s.muted);

  return (
    <SectionShell
      id="projects"
      code="04"
      title="Projects Lab"
      subtitle="Deployable modules — open any experiment to inspect its build."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          const isOpen = openId === p.id;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="glass group relative flex flex-col rounded-xl p-4 transition hover:border-neon/50 hover:shadow-neon-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded border border-neon2/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon2">
                  {p.category}
                </span>
                <span className="font-mono text-[10px] text-neon">● {p.status}</span>
              </div>

              <h3 className="font-display text-base font-bold text-ink group-hover:neon-text">
                {p.title}
              </h3>
              <p className="mt-1 text-xs text-ink/55">{p.impact}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                {p.stack.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ink/60"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  sfx.blip(muted);
                  setOpenId(isOpen ? null : p.id);
                }}
                className="mt-3 text-left font-mono text-[11px] uppercase tracking-widest text-neon2/80 transition hover:text-neon"
              >
                {isOpen ? "▾ hide details" : "▸ view details"}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2 border-t border-white/5 pt-3 text-xs">
                      <p>
                        <span className="font-mono text-neon">PROBLEM</span>{" "}
                        <span className="text-ink/70">{p.problem}</span>
                      </p>
                      <p>
                        <span className="font-mono text-neon">ROLE</span>{" "}
                        <span className="text-ink/70">{p.role}</span>
                      </p>
                      <p>
                        <span className="font-mono text-neon">STACK</span>{" "}
                        <span className="text-ink/70">{p.stack.join(", ")}</span>
                      </p>
                    </div>
                    <DeployButton />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
