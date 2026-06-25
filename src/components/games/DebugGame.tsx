"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

interface Puzzle {
  prompt: string;
  buggy: string;
  options: string[];
  answer: number;
  explain: string;
}

const PUZZLES: Puzzle[] = [
  {
    prompt: "This loop never terminates. Pick the fix.",
    buggy: "for (let i = 0; i < 5; i--) {\n  render(items[i]);\n}",
    options: ["i++", "i = i", "i += 0", "break"],
    answer: 0,
    explain: "i-- counts down forever — it must be i++ to reach the bound.",
  },
  {
    prompt: "Why does this React state update not re-render?",
    buggy: "state.count = state.count + 1;\nreturn <p>{state.count}</p>;",
    options: ["use setCount(c => c + 1)", "add a comment", "rename count", "use var"],
    answer: 0,
    explain: "Mutating state directly skips React's setter — use the updater function.",
  },
  {
    prompt: "This async value logs `undefined`. Fix it.",
    buggy: "const data = fetchUser();\nconsole.log(data.name);",
    options: ["await fetchUser()", "JSON.parse", "data?.name", "remove log"],
    answer: 0,
    explain: "fetchUser() returns a Promise — you must await it before reading .name.",
  },
];

export default function DebugGame() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const addXp = useGameStore((s) => s.addXp);
  const muted = useGameStore((s) => s.muted);
  const puzzle = PUZZLES[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === puzzle.answer) {
      sfx.achievement(muted);
      addXp(6);
      if (idx === PUZZLES.length - 1) {
        setSolved(true);
        unlockAchievement("mfe"); // award the architect badge as the easter-egg reward
      }
    } else {
      sfx.error(muted);
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % PUZZLES.length);
  };

  return (
    <div className="glass-strong rounded-2xl p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-neon2">
          // debug_the_bug.exe
        </p>
        <span className="font-mono text-[10px] text-ink/40">
          {idx + 1}/{PUZZLES.length}
        </span>
      </div>

      <p className="mb-3 text-sm text-ink/85">{puzzle.prompt}</p>

      <pre className="mb-4 overflow-x-auto rounded-lg border border-red-400/30 bg-black/50 p-3 font-mono text-xs text-red-300">
        {puzzle.buggy}
      </pre>

      <div className="grid gap-2 sm:grid-cols-2">
        {puzzle.options.map((opt, i) => {
          const isAnswer = i === puzzle.answer;
          const show = picked !== null;
          return (
            <button
              key={opt}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`rounded-lg border px-3 py-2 text-left font-mono text-xs transition ${
                show && isAnswer
                  ? "border-neon bg-neon/15 text-neon"
                  : show && picked === i
                  ? "border-red-400/60 bg-red-400/10 text-red-300"
                  : "border-white/15 text-ink/70 hover:border-neon/40"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 overflow-hidden"
          >
            <p
              className={`text-xs ${
                picked === puzzle.answer ? "text-neon" : "text-yellow-400/80"
              }`}
            >
              {picked === puzzle.answer ? "✓ Patched. " : "✗ Not quite. "}
              {puzzle.explain}
            </p>
            <button
              onClick={next}
              className="mt-2 rounded-md border border-neon/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-neon transition hover:bg-neon/10"
            >
              {solved ? "▸ replay" : "▸ next bug"}
            </button>
            {solved && (
              <p className="mt-2 text-xs text-neon2">
                🏆 All bugs squashed — &quot;Micro-Frontend Architect&quot; badge secured.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
