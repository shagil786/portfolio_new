/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL in your env / Vercel project
 * to your real domain; falls back to the deployed Vercel domain so canonical,
 * sitemap, and JSON-LD URLs all resolve to the same origin.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://portfolio-new-eta-tawny.vercel.app";

export const SITE_NAME = "MSN OS";

/**
 * Every crawlable route, used by the sitemap, llms.txt, and the markdown
 * variant of the 404 page so agents always have a recoverable site map.
 */
export const ROUTES = [
  "",
  "/resume",
  "/projects",
  "/terminal",
  "/contact",
  "/about",
  "/privacy",
  "/docs",
] as const;

export const ROUTE_TITLES: Record<string, string> = {
  "": "Home — Interactive Command Center",
  "/resume": "Resume",
  "/projects": "Projects Lab",
  "/terminal": "Terminal",
  "/contact": "Contact",
  "/about": "About",
  "/privacy": "Privacy",
  "/docs": "Developer Resources",
};

/** Machine-readable surfaces an agent can fetch directly. */
export const AGENT_RESOURCES = [
  { path: "/llms.txt", description: "Agent guide: when to use this site, and how to fetch content" },
  { path: "/sitemap.xml", description: "XML sitemap of all crawlable routes" },
  { path: "/openapi.json", description: "OpenAPI 3.1 spec for the public JSON API" },
  { path: "/.well-known/mcp", description: "MCP server (Streamable HTTP) exposing portfolio tools" },
  { path: "/docs", description: "Developer portal: API docs, auth notes, MCP tools" },
] as const;
