"use client";

import { motion } from "framer-motion";
import { profile, links, education } from "@/data/portfolioData";
import SectionShell from "./SectionShell";

const stats = [
  { label: "Role", value: profile.role },
  { label: "Company", value: profile.company },
  { label: "Location", value: profile.location },
  { label: "Experience", value: profile.experienceYears },
  { label: "Education", value: `${education[0].degree.replace("BE in ", "B.E. ")}` },
];

export default function Identity() {
  return (
    <SectionShell
      id="identity"
      code="01"
      title="Identity"
      subtitle="Operator dossier — who is behind the terminal."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Character card */}
        <motion.div
          whileHover={{ rotateX: 3, rotateY: -3 }}
          style={{ transformStyle: "preserve-3d" }}
          className="glass-strong relative overflow-hidden rounded-2xl p-6"
        >
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-neon/20 blur-2xl" />
          <div className="mb-4 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-xl border border-neon/50 bg-black/40 font-display text-2xl font-bold neon-text">
              {profile.shortName}
            </div>
            <div>
              <p className="font-display text-lg font-bold text-ink">{profile.name}</p>
              <p className="font-mono text-xs text-neon2">{profile.altRole}</p>
            </div>
          </div>

          <dl className="space-y-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm"
              >
                <dt className="text-ink/50">{s.label}</dt>
                <dd className="text-right font-mono text-ink/90">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex gap-3">
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md border border-neon/30 py-2 text-center text-xs uppercase tracking-widest text-ink/70 transition hover:text-neon"
            >
              GitHub
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md border border-neon/30 py-2 text-center text-xs uppercase tracking-widest text-ink/70 transition hover:text-neon"
            >
              LinkedIn
            </a>
          </div>
        </motion.div>

        {/* Bio + specializations */}
        <div className="flex flex-col justify-center">
          <p className="text-lg leading-relaxed text-ink/85 md:text-xl">
            {profile.summary}
          </p>
          <div className="mt-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neon2/80">
              // specialization
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-neon/25 bg-neon/5 px-3 py-1 text-xs text-ink/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
