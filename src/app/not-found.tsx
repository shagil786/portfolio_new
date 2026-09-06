import Link from "next/link";
import { ROUTES, ROUTE_TITLES, SITE_URL } from "@/lib/site";

/**
 * Real HTTP 404 with a recovery body: agents that hit a dead link get the site
 * map and machine-readable indexes instead of a bare error.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 font-mono text-ink">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neon/70">
        // 404 · route not found
      </p>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        There is no page at this path on MSN OS. Nothing broke — here is where
        to look next.
      </p>

      <h2 className="mt-8 text-xs uppercase tracking-widest text-neon/80">Site map</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {ROUTES.map((r) => (
          <li key={r}>
            <Link
              href={r || "/"}
              className="text-ink/80 underline-offset-4 transition hover:text-neon hover:underline"
            >
              {ROUTE_TITLES[r] ?? r}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xs uppercase tracking-widest text-neon/80">Where to look next</h2>
      <ul className="mt-3 space-y-1 text-sm">
        <li><a className="text-ink/80 hover:text-neon" href="/llms.txt">llms.txt</a> — agent guide and resource index</li>
        <li><a className="text-ink/80 hover:text-neon" href="/docs">Developer resources</a> — API docs, OpenAPI spec, MCP server</li>
        <li><a className="text-ink/80 hover:text-neon" href="/sitemap.xml">Sitemap</a> — all crawlable routes</li>
      </ul>

      <p className="mt-10 text-xs text-ink/40">
        Markdown variants: request any page with <code>Accept: text/markdown</code> · canonical site {SITE_URL}
      </p>
    </div>
  );
}
