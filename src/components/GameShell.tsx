"use client";

import { AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";

import BootScreen from "@/components/boot/BootScreen";
import ThemeManager from "@/components/ui/ThemeManager";
import HUD from "@/components/ui/HUD";
import MiniMap from "@/components/ui/MiniMap";
import MSNBot from "@/components/ui/MSNBot";
import PresenceOrb from "@/components/ui/PresenceOrb";
import CommandPalette from "@/components/ui/CommandPalette";
import Scanlines from "@/components/ui/Scanlines";
import MatrixRain from "@/components/ui/MatrixRain";
import CursorFX from "@/components/ui/CursorFX";

import Hero from "@/components/sections/Hero";
import MissionMap from "@/components/sections/MissionMap";
import Identity from "@/components/sections/Identity";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import GitHubSection from "@/components/sections/GitHubSection";
import Achievements from "@/components/sections/Achievements";
import TerminalSection from "@/components/sections/TerminalSection";
import Contact from "@/components/sections/Contact";
import RecruiterView from "@/components/sections/RecruiterView";

export default function GameShell() {
  const booted = useGameStore((s) => s.booted);
  const recruiterMode = useGameStore((s) => s.recruiterMode);

  return (
    <>
      <ThemeManager />
      <CursorFX />
      <Scanlines />
      <CommandPalette />

      <AnimatePresence>{!booted && <BootScreen />}</AnimatePresence>

      {booted && (
        <>
          <HUD />
          <PresenceOrb />
          {recruiterMode ? (
            <RecruiterView />
          ) : (
            <>
              <MatrixRain opacity={0.12} />
              <MiniMap />
              <MSNBot />
              <main className="relative z-10">
                <Hero />
                <MissionMap />
                <Identity />
                <Experience />
                <Skills />
                <Projects />
                <GitHubSection />
                <Achievements />
                <TerminalSection />
                <Contact />
                <footer className="border-t border-white/10 py-8 text-center font-mono text-[11px] text-ink/40">
                  <p>// MSN OS v4.0 — built with Next.js, R3F & Framer Motion</p>
                  <p className="mt-1">© {new Date().getFullYear()} Md Shagil Nizami</p>
                </footer>
              </main>
            </>
          )}
        </>
      )}
    </>
  );
}
