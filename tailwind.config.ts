import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme tokens are driven by CSS variables so the runtime theme
        // switcher (Hacker Green / Cyber Purple / Finance Blue) just works.
        neon: "rgb(var(--neon) / <alpha-value>)",
        neon2: "rgb(var(--neon-2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 12px rgb(var(--neon) / 0.55), 0 0 32px rgb(var(--neon) / 0.25)",
        "neon-sm": "0 0 6px rgb(var(--neon) / 0.5)",
        glass: "inset 0 1px 0 0 rgb(255 255 255 / 0.06), 0 8px 40px -8px rgb(0 0 0 / 0.6)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41.99%": { opacity: "1" },
          "42%": { opacity: "0.4" },
          "43%": { opacity: "1" },
          "47%": { opacity: "0.6" },
          "48%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgb(var(--neon) / 0.5)" },
          "50%": { boxShadow: "0 0 22px rgb(var(--neon) / 0.9)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        gridmove: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
      },
      animation: {
        flicker: "flicker 4s linear infinite",
        scan: "scan 6s linear infinite",
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        blink: "blink 1s steps(1) infinite",
        gridmove: "gridmove 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
