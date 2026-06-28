"use client";

import { motion } from "framer-motion";
import {
  profile,
  links,
  experiences,
  skillCategories,
  projects,
  education,
} from "@/data/portfolioData";
import { useGameStore } from "@/store/useGameStore";

/**
 * Clean, fast, scannable resume view for recruiters who want to skip the game.
 * Toggled via the HUD "recruiter" button or `sudo hire shagil`.
 */
export default function RecruiterView() {
  const toggleRecruiter = useGameStore((s) => s.toggleRecruiter);
  const ordered = [...experiences].sort((a, b) => b.level - a.level);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-24 md:px-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon2">
          recruiter mode · clean view
        </span>
        <button
          onClick={toggleRecruiter}
          className="rounded-md border border-neon/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon transition hover:bg-neon/10"
        >
          ▸ enter the game
        </button>
      </div>

      {/* header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-1 text-neon">{profile.role}</p>
        <p className="text-sm text-ink/60">{profile.altRole}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
          <a href={`mailto:${links.email}`} className="hover:text-neon">{links.email}</a>
          <span>{links.phone}</span>
          <span>{profile.location}</span>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="hover:text-neon">GitHub</a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-neon">LinkedIn</a>
        </div>
        <a
          href={links.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-neon/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neon neon-border transition hover:bg-neon/25"
        >
          ↓ Download Resume (PDF)
        </a>
      </header>

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-ink/80">{profile.summary}</p>
      </Section>

      <Section title="Experience">
        <div className="space-y-5">
          {ordered.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <h3 className="font-semibold text-ink">
                  {e.role} · <span className="text-neon">{e.company}</span>
                </h3>
                <span className="font-mono text-xs text-ink/50">{e.date}</span>
              </div>
              <ul className="mt-1 space-y-1">
                {e.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink/75">
                    <span className="text-neon">▹</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills">
        <div className="space-y-2">
          {skillCategories.map((c) => (
            <p key={c.id} className="text-sm">
              <span className="font-mono text-neon2">{c.label}:</span>{" "}
              <span className="text-ink/75">{c.skills.map((s) => s.name).join(", ")}</span>
            </p>
          ))}
        </div>
      </Section>

      <Section title="Selected Projects">
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-ink">{p.title}</p>
              <p className="text-xs text-ink/60">{p.impact}</p>
              <p className="mt-1 font-mono text-[10px] text-neon2">{p.stack.join(" · ")}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Education">
        {education.map((e) => (
          <div key={e.institution} className="flex flex-wrap items-baseline justify-between gap-1">
            <div>
              <p className="font-semibold text-ink">{e.institution}</p>
              <p className="text-sm text-ink/65">{e.degree}</p>
            </div>
            <span className="font-mono text-xs text-ink/50">
              {e.date} · {e.location}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Contact">
        <p className="text-sm text-ink/75">
          {links.email} · {links.phone} · {profile.location}
        </p>
      </Section>
    </motion.main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">
        {title}
      </h2>
      {children}
    </section>
  );
}
