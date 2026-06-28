"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { links, profile } from "@/data/portfolioData";
import SectionShell from "./SectionShell";
import ContactForm from "./ContactForm";
import { useGameStore } from "@/store/useGameStore";
import { sfx } from "@/lib/sounds";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const muted = useGameStore((s) => s.muted);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      sfx.unlock(muted);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const buttons = [
    { label: "Send Email", href: `mailto:${links.email}`, primary: true },
    { label: "Open GitHub", href: links.github, external: true },
    { label: "Open LinkedIn", href: links.linkedin, external: true },
    { label: "Download Resume", href: links.resume, external: true },
  ];

  return (
    <SectionShell
      id="contact"
      code="06"
      title="Final Mission: Hire / Collaborate"
      subtitle="The last objective — let's build the next scalable product together."
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-strong relative overflow-hidden rounded-2xl p-6 md:p-10"
      >
        <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-neon to-transparent" />

        <p className="font-display text-2xl font-bold neon-text md:text-4xl">
          Mission complete.
        </p>
        <p className="mt-2 max-w-xl text-ink/70">
          Ready to build the next scalable product? Reach out and let&apos;s ship
          something fast, reliable, and beautiful.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={copyEmail}
            className="glass flex items-center justify-between rounded-lg p-3 text-left transition hover:border-neon/50"
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/40">
                email
              </span>
              <span className="text-sm text-ink/90">{links.email}</span>
            </span>
            <span className="font-mono text-[10px] text-neon">
              {copied ? "copied ✓" : "copy"}
            </span>
          </button>

          <div className="glass rounded-lg p-3">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/40">
              phone
            </span>
            <span className="text-sm text-ink/90">{links.phone}</span>
          </div>

          <div className="glass rounded-lg p-3">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/40">
              location
            </span>
            <span className="text-sm text-ink/90">{profile.location}</span>
          </div>
        </div>

        <div className="mt-6">
          <ContactForm />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {buttons.map((b) => (
            <a
              key={b.label}
              href={b.href}
              target={b.external ? "_blank" : undefined}
              rel={b.external ? "noopener noreferrer" : undefined}
              className={`rounded-md px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition ${
                b.primary
                  ? "bg-neon/15 text-neon neon-border hover:bg-neon/25 hover:shadow-neon"
                  : "glass text-ink/80 hover:text-neon"
              }`}
            >
              {b.label}
            </a>
          ))}
        </div>
      </motion.div>
    </SectionShell>
  );
}
