import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import { links } from "@/data/portfolioData";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Developer Resources — API Docs, OpenAPI & MCP`,
  description: `Developer portal for ${SITE_NAME}: public JSON API endpoints, OpenAPI 3.1 spec, and a Model Context Protocol (MCP) server exposing portfolio data as tools.`,
  alternates: { canonical: "/docs" },
};

function Endpoint({ method, path, children }: {
  method: "GET" | "POST";
  path: string;
  children: React.ReactNode;
}) {
  return (
    <li className="leading-relaxed">
      <span className={`mr-2 inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-widest ${
        method === "GET" ? "border-neon/40 text-neon" : "border-neon2/40 text-neon2"
      }`}>
        {method}
      </span>
      <code className="text-ink">{path}</code>
      <span className="block pl-1 text-sm text-ink/60">{children}</span>
    </li>
  );
}

export default function DocsPage() {
  return (
    <RouteFrame>
      <article className="font-mono text-ink/80">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          {SITE_NAME} Developer Resources
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-neon/70">
          API docs · OpenAPI spec · MCP server
        </p>
        <p className="mt-6 leading-relaxed">
          Integrate with {SITE_NAME} — the portfolio of Md Shagil Nizami —
          programmatically. All endpoints are public and read-only except the
          contact API, which accepts public submissions with basic validation.
          No API keys are required.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">JSON API</h2>
        <ul className="mt-4 space-y-4">
          <Endpoint method="GET" path={`${SITE_URL}/api/github`}>
            Public repositories and a 53-week contribution calendar for Md Shagil Nizami. Cached one hour.
          </Endpoint>
          <Endpoint method="GET" path={`${SITE_URL}/api/presence`}>
            Count of visitors currently online.
          </Endpoint>
          <Endpoint method="POST" path={`${SITE_URL}/api/presence`}>
            Heartbeat with a random session id: {"{ \"id\": \"<uuid>\" }"}.
          </Endpoint>
          <Endpoint method="POST" path={`${SITE_URL}/api/contact`}>
            Send a contact message: {"{ \"name\", \"email\", \"message\" }"} (JSON). Returns 503 with
            {" "}<code>{`{ "fallback": true }`}</code> when email delivery is not configured — fall back to{" "}
            <a className="text-neon hover:underline" href={`mailto:${links.email}`}>{links.email}</a>.
          </Endpoint>
        </ul>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">OpenAPI spec</h2>
        <p className="mt-4 leading-relaxed">
          Machine-readable contract (OpenAPI 3.1):{" "}
          <a className="text-neon hover:underline" href="/openapi.json">{SITE_URL}/openapi.json</a>
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">MCP server (Model Context Protocol)</h2>
        <p className="mt-4 leading-relaxed">
          Streamable HTTP endpoint: <code>{SITE_URL}/.well-known/mcp</code>.
          JSON-RPC 2.0 over POST; methods: <code>initialize</code>,{" "}
          <code>tools/list</code>, <code>tools/call</code>, <code>ping</code>.
          Tools: <code>get_profile</code>, <code>get_experience</code>,{" "}
          <code>get_projects</code>, <code>get_skills</code>,{" "}
          <code>get_achievements</code>, <code>get_education</code>,{" "}
          <code>get_contact</code>. No auth required — the data is public and
          read-only.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">Markdown content</h2>
        <p className="mt-4 leading-relaxed">
          Every page serves markdown when requested with{" "}
          <code>Accept: text/markdown</code> — including this one. Responses
          carry <code>Vary: Accept, Accept-Encoding</code> so caches keep the
          variants separate.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">On-device AI</h2>
        <p className="mt-4 leading-relaxed">
          The MSN AI chat assistant runs <a className="text-neon hover:underline" href="https://github.com/cactus-compute/needle" target="_blank" rel="noopener noreferrer">Needle 2</a> — a
          14MB tool-calling model — fully in your browser (WebAssembly, no server, no API key).
          It routes questions to the same tools exposed above; every answer is generated
          deterministically from the site&apos;s data, with a scripted fallback.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">Agent indexes</h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 leading-relaxed">
          <li><a className="text-neon hover:underline" href="/llms.txt">llms.txt</a> — when to use this site, and how</li>
          <li><a className="text-neon hover:underline" href="/sitemap.xml">sitemap.xml</a> — all crawlable routes</li>
          <li><a className="text-neon hover:underline" href="/robots.txt">robots.txt</a> — crawling rules</li>
        </ul>
      </article>
    </RouteFrame>
  );
}
