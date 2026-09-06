import type { Metadata } from "next";
import RouteFrame from "@/components/RouteFrame";
import { links, profile } from "@/data/portfolioData";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy policy for MSN OS — what this personal portfolio collects (contact messages, cookieless analytics), what it never collects, and how to reach out.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <RouteFrame>
      <article className="font-mono text-ink/80">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Privacy</h1>
        <p className="mt-6 leading-relaxed">
          This personal portfolio by {profile.name} collects
          as little as possible. This page describes exactly what is collected,
          what is never collected, and how to get data corrected or removed.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">What this site collects</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
          <li>
            <strong>Contact form.</strong> Messages sent through the contact
            form (name, email, message) are forwarded by email to{" "}
            <a className="text-neon hover:underline" href={`mailto:${links.email}`}>{links.email}</a>{" "}
            and are not stored in a database by this site.
          </li>
          <li>
            <strong>Analytics.</strong> Anonymous, cookieless usage metrics via
            Vercel Analytics and Vercel Speed Insights (page views, web vitals,
            performance). No cross-site tracking, no advertising cookies, and
            no sale or sharing of data.
          </li>
          <li>
            <strong>GitHub data.</strong> The site fetches public GitHub
            repository and contribution data for the site owner only and caches
            it server-side for one hour. No visitor GitHub data is requested or
            stored.
          </li>
          <li>
            <strong>Live presence counter.</strong> A random session id
            generated in your browser is used to count &ldquo;visitors online
            now&rdquo;. It is not linked to your identity and expires 30
            seconds after your last visit activity.
          </li>
        </ul>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">What this site never collects</h2>
        <p className="mt-4 leading-relaxed">
          No tracking cookies, no fingerprinting, no advertising identifiers,
          no third-party ad scripts, and no data broker transfers. Because no
          tracking cookies are set, no consent banner is required.
        </p>

        <h2 className="mt-10 font-display text-xl font-bold text-ink">Your choices</h2>
        <p className="mt-4 leading-relaxed">
          To correct or delete any information about you on this site, email{" "}
          <a className="text-neon hover:underline" href={`mailto:${links.email}`}>{links.email}</a>
          . Server-side analytics retention follows Vercel&rsquo;s default
          retention window for anonymous aggregates.
        </p>
      </article>
    </RouteFrame>
  );
}
