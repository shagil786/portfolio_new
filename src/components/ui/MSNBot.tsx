"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { botReply, QUICK_REPLIES } from "@/lib/botEngine";
import { sfx } from "@/lib/sounds";

interface ChatMsg {
  from: "bot" | "user";
  text: string;
}

const TIPS: Record<string, string> = {
  hero: "Welcome, operator. I'm MSN AI — tap me to ask anything about Shagil.",
  identity: "Mission 01: the operator dossier. Ask me 'who is Shagil?'",
  experience: "Mission 02: ask me 'experience at Yahoo' for the full log.",
  skills: "Mission 03: ask me what Shagil knows — 'skills'.",
  projects: "Mission 04: ask 'projects' and I'll list the highlights.",
  achievements: "Mission 05: ask me about 'impact' and metrics.",
  contact: "Final mission: ask 'how do I contact Shagil?' or 'hire'.",
};

export default function MSNBot() {
  const active = useGameStore((s) => s.activeSection);
  const muted = useGameStore((s) => s.muted);
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      from: "bot",
      text: "Hi, I'm MSN AI 🤖 — Shagil's assistant. Ask me about his experience, skills, projects, or how to reach him.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const tip = TIPS[active] ?? TIPS.hero;

  // idle tip cycling (only while chat is closed)
  useEffect(() => {
    if (dismissed || open) return;
    setTipOpen(true);
    const t = setTimeout(() => setTipOpen(false), 6000);
    return () => clearTimeout(t);
  }, [active, dismissed, open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    sfx.blip(muted);
    const reply = botReply(q);
    const delay = Math.min(900, 250 + reply.length * 4);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply }]);
      setTyping(false);
      sfx.blip(muted);
    }, delay);
  };

  const toggle = () => {
    setOpen((o) => !o);
    setDismissed(true);
    setTipOpen(false);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-end gap-2">
      {/* avatar */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={open ? {} : { y: [0, -6, 0] }}
        transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        className="glass-strong relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-neon/50 shadow-neon-sm"
        aria-label={open ? "Close MSN AI chat" : "Open MSN AI chat"}
        aria-expanded={open}
      >
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulseGlow rounded-full bg-neon" />
        <BotFace />
      </motion.button>

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="glass-strong mb-1 flex h-[26rem] w-[20rem] max-w-[calc(100vw-6rem)] flex-col overflow-hidden rounded-2xl rounded-bl-none"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulseGlow rounded-full bg-neon" />
                <span className="font-display text-sm font-bold neon-text">MSN AI</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink/40">
                  assistant
                </span>
              </div>
              <button
                onClick={toggle}
                className="font-mono text-xs text-ink/50 transition hover:text-neon"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.from === "user"
                        ? "rounded-br-sm bg-neon/15 text-ink"
                        : "rounded-bl-sm border border-white/10 bg-black/30 text-ink/85"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-black/30 px-3 py-2">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* quick replies */}
            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-2">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => send(qr)}
                  className="rounded-full border border-neon/30 px-2.5 py-1 text-[10px] text-ink/70 transition hover:border-neon/60 hover:text-neon"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Shagil…"
                aria-label="Message MSN AI"
                className="flex-1 rounded-md bg-black/30 px-3 py-2 text-xs text-ink outline-none placeholder:text-ink/30"
              />
              <button
                type="submit"
                className="rounded-md bg-neon/15 px-3 py-2 font-mono text-xs uppercase tracking-widest text-neon neon-border transition hover:bg-neon/25"
              >
                ▸
              </button>
            </form>
          </motion.div>
        ) : (
          tipOpen && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, x: -10, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.92 }}
              className="glass mb-1 max-w-[240px] rounded-xl rounded-bl-none p-3"
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-neon2">
                MSN AI
              </p>
              <p className="text-xs leading-snug text-ink/85">{tip}</p>
              <button
                onClick={toggle}
                className="mt-1 font-mono text-[10px] text-neon hover:underline"
              >
                [ open chat › ]
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

function BotFace() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="8" width="20" height="16" rx="5" stroke="rgb(var(--neon))" strokeWidth="1.6" />
      <circle cx="12.5" cy="16" r="2.2" fill="rgb(var(--neon))" />
      <circle cx="19.5" cy="16" r="2.2" fill="rgb(var(--neon))" />
      <line x1="16" y1="3" x2="16" y2="8" stroke="rgb(var(--neon))" strokeWidth="1.6" />
      <circle cx="16" cy="2.4" r="1.6" fill="rgb(var(--neon2))" />
    </svg>
  );
}
