import type { ThemeName } from "@/store/useGameStore";

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  /** data-theme attribute value used by globals.css */
  attr: string;
  /** hero/3D accent colors (hex) for three.js materials */
  three: { neon: string; neon2: string; accent: string };
  swatch: string;
}

export const THEMES: Record<ThemeName, ThemeMeta> = {
  green: {
    name: "green",
    label: "Hacker Green",
    attr: "green",
    three: { neon: "#39ff99", neon2: "#22d3ee", accent: "#a855f7" },
    swatch: "#39ff99",
  },
  purple: {
    name: "purple",
    label: "Cyber Purple",
    attr: "purple",
    three: { neon: "#c084fc", neon2: "#e879f9", accent: "#22d3ee" },
    swatch: "#c084fc",
  },
  blue: {
    name: "blue",
    label: "Finance Blue",
    attr: "blue",
    three: { neon: "#38bdf8", neon2: "#2dd4bf", accent: "#60a5fa" },
    swatch: "#38bdf8",
  },
};

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  // 'green' is the :root default — clear the attribute for it.
  if (theme === "green") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", THEMES[theme].attr);
  }
}
