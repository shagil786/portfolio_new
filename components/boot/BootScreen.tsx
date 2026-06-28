"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bootLines, profile } from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function BootScreen() {
  const setBooted = useGameStore((s) => s.setBooted);
  const muted = useGameStore((s) => s.muted);
  const [shown, setShown] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setShown(bootLines);
      setProgress(100);
      setDone(true);
      return;
    }

    const lineTimer = setInterval(() => {
      if (idx.current >= bootLines.length) {
        clearInterval(lineTimer);
        setDone(true);
        return;
      }
      setShown((prev) => [...prev, bootLines[idx.current]]);
      sfx.blip(useGameStore.getState().muted);
      idx.current += 1;
    }, 520);

    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 9 + 4));
    }, 240);

    return () => {
      clearInterval(lineTimer);
      clearInterval(progTimer);
    };
  }, []);

  useEffect(() => {
    if (done && progress >= 100) {
      sfx.boot(muted);
      const t = setTimeout(() => finish(), 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, progress]);

  const finish = () => {
    setSkipped(true);
    setTimeout(() => setBooted(true), 500);
  };

  return (
    <AnimatePresence>
      {!skipped && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[rgb(var(--bg))] px-6 font-mono"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-cybergrid pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative w-full max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-3 w-3 animate-pulseGlow rounded-full bg-neon" />
              <span className="text-xs uppercase tracking-[0.4em] text-neon/70">
                {profile.shortName} OS // secure boot
              </span>
            </div>

            <div className="glass min-h-[260px] rounded-lg p-5 text-sm leading-relaxed shadow-glass">
              {shown.filter(Boolean).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 text-neon/90"
                >
                  <span className="text-neon2">›</span>
                  <span>{line}</span>
                  {i === shown.length - 1 && !done && (
                    <span className="animate-blink">_</span>
                  )}
                  {done && line?.includes("granted") && (
                    <span className="text-neon">✓</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-ink/50">
                <span>decrypting modules</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-neon/30 bg-black/40">
                <motion.div
                  className="h-full bg-neon shadow-neon"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>

            <button
              onClick={finish}
              className="mt-6 text-xs uppercase tracking-widest text-ink/50 underline-offset-4 transition hover:text-neon hover:underline"
            >
              [ skip boot › enter command center ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
