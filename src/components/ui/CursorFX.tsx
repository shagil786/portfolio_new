"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hacker-style custom cursor: a precise center dot + a lagging neon ring that
 * grows over interactive elements. Disabled on touch / coarse pointers and
 * when the OS requests reduced motion (falls back to the native cursor).
 */
export default function CursorFX() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return; // touch devices keep the native cursor
    setEnabled(true);
    document.documentElement.classList.add("cursor-hidden");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;
    let down = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      // hover state on interactive elements
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.("a, button, input, textarea, [role='button'], summary");
      ringRef.current?.classList.toggle("cursor-ring--hover", interactive);
    };
    const onDown = () => {
      down = true;
      ringRef.current?.classList.add("cursor-ring--down");
    };
    const onUp = () => {
      down = false;
      ringRef.current?.classList.remove("cursor-ring--down");
    };
    const onLeave = () => ringRef.current?.classList.add("cursor-ring--hidden");
    const onEnter = () => ringRef.current?.classList.remove("cursor-ring--hidden");

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
