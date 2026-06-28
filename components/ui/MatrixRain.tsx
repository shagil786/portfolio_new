"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";

/**
 * Canvas matrix rain. Pauses for reduced-motion and low-power mode.
 */
export default function MatrixRain({ opacity = 0.18 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useGameStore((s) => s.theme);
  const lowPower = useGameStore((s) => s.lowPower);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || lowPower) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let drops: number[] = [];
    const fontSize = 14;
    const chars = "01ｱｲｳｴｵｶｷｸ<>{}[]#$%&*=+-/\\ABCDEF0123456789".split("");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    };
    resize();
    window.addEventListener("resize", resize);

    const color = THEMES[theme].three.neon;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 55) return; // throttle ~18fps
      last = t;
      ctx.fillStyle = "rgba(2,5,7,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [theme, lowPower]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
    />
  );
}
