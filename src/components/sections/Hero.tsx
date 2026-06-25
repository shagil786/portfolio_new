"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { profile, links } from "@/data/portfolioData";
import GlitchText from "@/components/ui/GlitchText";
import { useGameStore } from "@/store/useGameStore";

// 3D scene is heavy → load only on the client, lazily, with a fallback.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <span className="animate-pulse font-mono text-xs uppercase tracking-[0.4em] text-neon/60">
        rendering command center…
      </span>
    </div>
  ),
});

function CTA({
  label,
  href,
  primary,
  onClick,
  external,
}: {
  label: string;
  href?: string;
  primary?: boolean;
  onClick?: () => void;
  external?: boolean;
}) {
  const base =
    "rounded-md px-5 py-2.5 text-xs md:text-sm font-mono uppercase tracking-widest transition-all duration-200";
  const styles = primary
    ? "bg-neon/15 text-neon neon-border hover:bg-neon/25 hover:shadow-neon"
    : "glass text-ink/80 hover:text-neon hover:border-neon/50";
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`${base} ${styles}`}
      >
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
}

export default function Hero() {
  const lowPower = useGameStore((s) => s.lowPower);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative flex min-h-[100svh] w-full items-center overflow-hidden">
      {!lowPower && <HeroScene />}
      {lowPower && <div className="bg-cybergrid absolute inset-0 z-0 opacity-30" />}

      {/* gradient legibility wash */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[rgb(var(--bg))]/90 via-[rgb(var(--bg))]/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[rgb(var(--bg))] to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-neon/80">
            <span className="h-2 w-2 animate-pulseGlow rounded-full bg-neon" />
            system online · {profile.location}
          </div>

          <p className="mb-2 font-mono text-sm text-neon2/90">Hi, I&apos;m</p>
          <GlitchText
            as="h1"
            text={profile.name}
            className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
          />

          <div className="mt-4 space-y-1 font-mono text-sm text-ink/80 md:text-base">
            <p className="text-glow-soft">{profile.role}</p>
            <p className="text-ink/60">{profile.altRole}</p>
            <p className="max-w-xl text-ink/55">{profile.tagline}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTA label="▸ Start Mission" primary onClick={() => scrollTo("identity")} />
            <CTA label="View Resume" href={links.resume} external />
            <CTA label="Contact Me" onClick={() => scrollTo("contact")} />
            <CTA label="GitHub" href={links.github} external />
            <CTA label="LinkedIn" href={links.linkedin} external />
          </div>

          <motion.div
            className="mt-12 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>scroll to deploy missions</span>
            <span className="text-neon">▼</span>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
