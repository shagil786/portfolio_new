/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL in your env / Vercel project
 * to your real domain; falls back to the existing GitHub Pages portfolio.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://shagilhmx.github.io";

export const ROUTES = ["", "/resume", "/projects", "/terminal", "/contact"];
