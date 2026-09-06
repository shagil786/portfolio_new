import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import { profile, links } from "@/data/portfolioData";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${profile.name} (${SITE_NAME}) — ${profile.role} at ${profile.company}, based in ${profile.location}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <RouteFrame>
      <article className="font-mono text-ink/80">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          About {profile.name}
        </h1>
        <p className="mt-6 leading-relaxed">
          {profile.name} — known online as &ldquo;{SITE_NAME}&rdquo; — is a{" "}
          {profile.role} at {profile.company}, based in {profile.location}, with{" "}
          {profile.experienceYears} of experience building production web
          software. {profile.summary}
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">What this site is</h2>
        <p className="mt-4 leading-relaxed">
          {SITE_NAME} is {profile.name}&rsquo;s personal portfolio and command
          center: an interactive presentation of experience, skills, projects,
          and achievements. It ships plain, machine-readable equivalents of
          every page — markdown via <code>Accept: text/markdown</code>, an{" "}
          <a className="text-neon hover:underline" href="/llms.txt">llms.txt agent guide</a>, a{" "}
          <a className="text-neon hover:underline" href="/sitemap.xml">sitemap</a>, an{" "}
          <a className="text-neon hover:underline" href="/openapi.json">OpenAPI spec</a>, and an{" "}
          <a className="text-neon hover:underline" href="/docs">MCP server</a> — so AI agents
          and other tools can consume the same facts without JavaScript.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">Specializations</h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 leading-relaxed">
          {profile.specializations.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">How to verify this identity</h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 leading-relaxed">
          <li>Canonical site: <a className="text-neon hover:underline" href={SITE_URL}>{SITE_URL}</a></li>
          <li>GitHub: <a className="text-neon hover:underline" href={links.github} target="_blank" rel="noopener noreferrer">{links.github}</a></li>
          <li>LinkedIn: <a className="text-neon hover:underline" href={links.linkedin} target="_blank" rel="noopener noreferrer">{links.linkedin}</a></li>
          <li>Email: <a className="text-neon hover:underline" href={`mailto:${links.email}`}>{links.email}</a></li>
        </ul>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">Current role</h2>
        <p className="mt-4 leading-relaxed">
          {profile.role} at {profile.company} since March 2025, leading the My
          Money personal finance platform and reusable CMS modules powering
          millions of linked financial accounts. Previously built SaaS builder
          platforms and lending micro-frontends at Fincity.
        </p>
      </article>
    </RouteFrame>
  );
}
