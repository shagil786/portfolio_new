"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { applyTheme } from "@/lib/themes";

/** Applies the active theme to <html data-theme> and auto-detects low-power. */
export default function ThemeManager() {
  const theme = useGameStore((s) => s.theme);
  const setLowPower = useGameStore((s) => s.setLowPower);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Heuristic: low-end devices / small screens / reduced motion → reduced 3D mode
    const cores = navigator.hardwareConcurrency ?? 4;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (cores <= 4 && small) setLowPower(true);
    if (reduced) setLowPower(true);
  }, [setLowPower]);

  return null;
}
