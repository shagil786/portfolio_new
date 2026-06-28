"use client";

/** Fixed CRT scanline + vignette overlay. Purely decorative. */
export default function Scanlines() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[55]">
      <div className="scanlines absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}
