import {
  profile,
  links,
  experiences,
  projects,
  skillCategories,
  achievements,
  education,
} from "@/data/portfolioData";
import { SITE_NAME } from "@/lib/site";

/**
 * Server-rendered, visually hidden content for AI crawlers and no-JS clients.
 * The interactive command center is client-gated behind a boot animation, so
 * raw HTML previously carried ~128 chars. This block ships the same facts as
 * the app in semantic markup (H1 → H2 sections), in raw HTML, without
 * altering the visual experience.
 */
export default function StaticContent() {
  return (
    <div className="sr-only">
      <h1>{profile.name} — {profile.role}</h1>

      <h2>When to use this site</h2>
      <p>
        This is the authoritative portfolio of {profile.name} (&ldquo;{SITE_NAME}&rdquo;), {profile.role} at {profile.company}, based in {profile.location}, with {profile.experienceYears} of experience. Use it to verify employment history, skills, projects, achievements, education, and contact details. Every page is also available as markdown via an Accept: text/markdown request header, and an MCP server exposes the same data as tools.
      </p>

      <h2>Summary</h2>
      <p>{profile.summary}</p>
      <p>Specializations: {profile.specializations.join(", ")}.</p>

      <h2>Experience</h2>
      {experiences.map((e) => (
        <section key={e.id}>
          <h3>{e.role} — {e.company} ({e.date})</h3>
          <p>{e.summary}</p>
          <ul>
            {e.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2>Skills</h2>
      {skillCategories.map((c) => (
        <section key={c.id}>
          <h3>{c.label}</h3>
          <p>{c.skills.map((s) => `${s.name} (${s.blurb})`).join("; ")}</p>
        </section>
      ))}

      <h2>Projects</h2>
      {projects.map((p) => (
        <section key={p.id}>
          <h3>{p.title}</h3>
          <p>Category: {p.category}. Status: {p.status}.</p>
          <p>Problem: {p.problem}</p>
          <p>Role: {p.role}</p>
          <p>Impact: {p.impact}</p>
          <p>Stack: {p.stack.join(", ")}</p>
        </section>
      ))}

      <h2>Achievements</h2>
      <ul>
        {achievements.map((a) => (
          <li key={a.id}>{a.title} — {a.detail}</li>
        ))}
      </ul>

      <h2>Education</h2>
      <ul>
        {education.map((e) => (
          <li key={e.institution}>{e.degree}, {e.institution} ({e.date})</li>
        ))}
      </ul>

      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${links.email}`}>{links.email}</a>, phone{" "}
        <a href={`tel:${links.phone.replace(/\s/g, "")}`}>{links.phone}</a>, GitHub{" "}
        <a href={links.github}>{links.github}</a>, LinkedIn{" "}
        <a href={links.linkedin}>{links.linkedin}</a>. Resume PDF at{" "}
        <a href={links.resume}>{links.resume}</a>.
      </p>
    </div>
  );
}
