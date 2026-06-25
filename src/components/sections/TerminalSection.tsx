"use client";

import { motion } from "framer-motion";
import Terminal from "@/components/terminal/Terminal";
import DebugGame from "@/components/games/DebugGame";

export default function TerminalSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-neon2/80">
            <span className="rounded border border-neon/40 px-2 py-0.5 text-neon">
              ROOT ACCESS
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-neon/50 to-transparent" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            <span className="neon-text">Hacker Terminal</span>
          </h2>
          <p className="max-w-2xl text-sm text-ink/60 md:text-base">
            A real, keyboard-driven console. Try <code className="text-neon">help</code>,{" "}
            <code className="text-neon">experience yahoo</code>, or the hidden{" "}
            <code className="text-neon">sudo hire shagil</code>. Patch the bugs to earn a badge.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Terminal />
          <DebugGame />
        </div>
      </motion.div>
    </section>
  );
}
