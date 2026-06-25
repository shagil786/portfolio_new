"use client";

import { useEffect, useRef, useState } from "react";
import { runCommand, COMMAND_NAMES, type TerminalLine } from "./commands";
import { useGameStore } from "@/store/useGameStore";
import { links } from "@/data/portfolioData";
import { sfx } from "@/lib/sounds";

const COLORS: Record<TerminalLine["type"], string> = {
  in: "text-ink/90",
  out: "text-ink/70",
  ok: "text-neon",
  err: "text-red-400",
  warn: "text-yellow-400/80",
  link: "text-neon2 underline cursor-pointer",
};

interface TerminalProps {
  fullscreen?: boolean;
  className?: string;
}

export default function Terminal({ fullscreen = false, className = "" }: TerminalProps) {
  const unlockAll = useGameStore((s) => s.unlockAll);
  const setRecruiter = useGameStore((s) => s.toggleRecruiter);
  const recruiterMode = useGameStore((s) => s.recruiterMode);
  const muted = useGameStore((s) => s.muted);

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "ok", text: "MSN OS terminal [v4.0] — type 'help' to begin." },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const submit = (raw: string) => {
    const result = runCommand(raw, {
      unlockAll,
      clear: () => setLines([]),
      openResume: () => {
        if (typeof window !== "undefined") window.open(links.resume, "_blank");
      },
      setHireMode: (v) => {
        if (v && !recruiterMode) setRecruiter();
      },
    });
    if (raw.trim().toLowerCase() === "clear" || raw.trim().toLowerCase() === "cls") {
      setLines([]);
    } else {
      setLines((prev) => [...prev, { type: "in", text: raw }, ...result]);
    }
    const last = result[result.length - 1];
    if (last?.type === "err") sfx.error(muted);
    else sfx.blip(muted);
    if (raw.trim()) setHistory((h) => [raw, ...h]);
    setHIndex(-1);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const ni = Math.min(hIndex + 1, history.length - 1);
      if (history[ni] !== undefined) {
        setHIndex(ni);
        setValue(history[ni]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(hIndex - 1, -1);
      setHIndex(ni);
      setValue(ni === -1 ? "" : history[ni]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMAND_NAMES.find((c) => c.startsWith(value.toLowerCase()));
      if (match) setValue(match);
    }
  };

  return (
    <div
      className={`glass-strong flex flex-col rounded-xl font-mono text-sm ${
        fullscreen ? "h-[80vh]" : "h-[420px]"
      } ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* titlebar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <span className="h-3 w-3 rounded-full bg-neon/70" />
        <span className="ml-2 text-[11px] uppercase tracking-widest text-ink/40">
          msn-os — bash
        </span>
      </div>

      {/* output */}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-4">
        {lines.map((l, i) =>
          l.type === "in" ? (
            <div key={i} className="text-ink/90">
              <span className="text-neon">visitor@msn-os</span>
              <span className="text-ink/40">:~$ </span>
              {l.text}
            </div>
          ) : l.type === "link" && l.href ? (
            <a
              key={i}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`block whitespace-pre-wrap ${COLORS[l.type]}`}
            >
              {l.text}
            </a>
          ) : (
            <div key={i} className={`whitespace-pre-wrap ${COLORS[l.type]}`}>
              {l.text}
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      {/* prompt */}
      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
        <span className="text-neon">visitor@msn-os</span>
        <span className="text-ink/40">:~$</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
          className="flex-1 bg-transparent text-ink outline-none placeholder:text-ink/30"
          placeholder="type a command… (help)"
        />
        <span className="animate-blink text-neon">▍</span>
      </div>
    </div>
  );
}
