"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { missions, links } from "@/data/portfolioData";
import { sfx } from "@/lib/sounds";

interface Action {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

export default function CommandPalette() {
  const open = useGameStore((s) => s.paletteOpen);
  const setOpen = useGameStore((s) => s.setPaletteOpen);
  const cycleTheme = useGameStore((s) => s.cycleTheme);
  const toggleRecruiter = useGameStore((s) => s.toggleRecruiter);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const unlockAll = useGameStore((s) => s.unlockAll);
  const muted = useGameStore((s) => s.muted);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const actions: Action[] = useMemo(
    () => [
      ...missions.map((m) => ({
        id: m.id,
        label: `Go to ${m.title}`,
        hint: `mission ${m.code}`,
        run: () => go(m.id),
      })),
      { id: "theme", label: "Cycle theme", hint: "appearance", run: () => cycleTheme() },
      { id: "recruiter", label: "Toggle recruiter mode", hint: "view", run: () => toggleRecruiter() },
      { id: "mute", label: "Toggle sound", hint: "audio", run: () => toggleMute() },
      { id: "unlock", label: "Unlock all missions", hint: "cheat", run: () => unlockAll() },
      {
        id: "resume",
        label: "Download resume",
        hint: "file",
        run: () => window.open(links.resume, "_blank"),
      },
      {
        id: "github",
        label: "Open GitHub",
        hint: "link",
        run: () => window.open(links.github, "_blank"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const filtered = actions.filter((a) =>
    (a.label + a.hint).toLowerCase().includes(query.toLowerCase())
  );

  // global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useGameStore.getState().paletteOpen);
        sfx.blip(useGameStore.getState().muted);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 px-4 pt-[18vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-lg overflow-hidden rounded-xl"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSel(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, filtered.length - 1));
                if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
                if (e.key === "Enter" && filtered[sel]) {
                  filtered[sel].run();
                  sfx.blip(muted);
                  if (filtered[sel].id !== "theme" && filtered[sel].id !== "mute") setOpen(false);
                }
              }}
              placeholder="Type a command or search…"
              className="w-full border-b border-white/10 bg-transparent px-4 py-3.5 font-mono text-sm text-ink outline-none placeholder:text-ink/30"
            />
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-center font-mono text-xs text-ink/40">
                  no matches
                </p>
              )}
              {filtered.map((a, i) => (
                <button
                  key={a.id}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    a.run();
                    sfx.blip(muted);
                    if (a.id !== "theme" && a.id !== "mute") setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                    sel === i ? "bg-neon/15 text-neon" : "text-ink/80"
                  }`}
                >
                  <span>{a.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                    {a.hint}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 px-4 py-2 font-mono text-[10px] text-ink/40">
              ↑↓ navigate · ↵ run · esc close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
