"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { links } from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const muted = useGameStore((s) => s.muted);
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailtoFallback = () => {
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    const subject = encodeURIComponent(`Portfolio message from ${form.name}`);
    window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setNote("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
        sfx.unlock(muted);
        setForm({ name: "", email: "", message: "", company: "" });
      } else if (data.fallback) {
        // backend email not configured → open the user's mail client instead
        setStatus("idle");
        setNote("Opening your email app…");
        mailtoFallback();
      } else {
        setStatus("error");
        setNote(data.error || "Something went wrong.");
        sfx.error(muted);
      }
    } catch {
      setStatus("error");
      setNote("Network error — opening your email app instead…");
      mailtoFallback();
    }
  };

  const field =
    "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-neon/50 placeholder:text-ink/30";

  return (
    <form onSubmit={submit} className="glass rounded-xl p-4 md:p-5" aria-label="Contact form">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neon2/80">
        // transmit_message.sh
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Your name"
          aria-label="Your name"
          className={field}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="Your email"
          aria-label="Your email"
          className={field}
        />
      </div>

      <textarea
        required
        value={form.message}
        onChange={set("message")}
        placeholder="Your message…"
        aria-label="Your message"
        rows={4}
        className={`${field} mt-3 resize-y`}
      />

      {/* honeypot — hidden from humans */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={set("company")}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-neon/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-neon neon-border transition hover:bg-neon/25 disabled:opacity-50"
        >
          {status === "sending" ? "transmitting…" : "▸ send message"}
        </button>
        <AnimatePresence>
          {status === "sent" && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-xs text-neon"
            >
              ✓ message sent — I&apos;ll reply soon.
            </motion.span>
          )}
          {(status === "error" || note) && status !== "sent" && (
            <span className="font-mono text-xs text-yellow-400/80">{note}</span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
