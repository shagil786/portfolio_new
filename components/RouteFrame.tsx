"use client";

import Link from "next/link";
import { useEffect } from "react";
import ThemeManager from "@/components/ui/ThemeManager";
import Scanlines from "@/components/ui/Scanlines";
import { useGameStore } from "@/store/useGameStore";

/**
 * Lightweight chrome for the standalone routes (/terminal, /projects, /contact,
 * /resume). Marks the OS as "booted" so shared section components behave, and
 * gives a consistent back link + theme handling.
 */
export default function RouteFrame({
  children,
  back = true,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  const setBooted = useGameStore((s) => s.setBooted);
  useEffect(() => setBooted(true), [setBooted]);

  return (
    <>
      <ThemeManager />
      <Scanlines />
      <div className="bg-cybergrid pointer-events-none fixed inset-0 z-0 opacity-20" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:px-8">
        {back && (
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/60 transition hover:text-neon"
          >
            ← back to command center
          </Link>
        )}
        {children}
      </div>
    </>
  );
}
