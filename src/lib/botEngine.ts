/**
 * MSN AI — a scripted assistant that answers questions about Md Shagil Nizami
 * straight from portfolioData. No API key, fully offline, deterministic. The
 * function signature is async-friendly so it can later be swapped for an LLM
 * call without changing the chat UI.
 */
import {
  profile,
  links,
  skillCategories,
  experiences,
  projects,
  achievements,
  githubWork,
  education,
} from "@/data/portfolioData";

export const QUICK_REPLIES = [
  "Who is Shagil?",
  "Experience",
  "Skills",
  "Projects",
  "Contact",
  "Resume",
];

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function botReply(raw: string): string {
  const q = raw.toLowerCase().trim();

  if (!q) return "Ask me anything about Shagil — try the quick replies below.";

  // greetings
  if (has(q, "hi", "hello", "hey", "yo", "sup", "namaste")) {
    return `Hey! I'm MSN AI — Shagil's assistant. I can tell you about his experience, skills, projects, or how to reach him. What would you like to know?`;
  }

  // about / who
  if (has(q, "who", "about", "yourself", "tell me", "summary", "intro")) {
    return `${profile.name} is a ${profile.role} at ${profile.company}, based in ${profile.location} (${profile.experienceYears} experience).\n\n${profile.summary}`;
  }

  // specific company / experience
  const exp = experiences.find((e) => q.includes(e.company.toLowerCase()));
  if (exp) {
    return `${exp.role} @ ${exp.company} (${exp.date}) — ${exp.theme}\n\n${exp.highlights
      .slice(0, 3)
      .map((h) => `• ${h}`)
      .join("\n")}\n\nStack: ${exp.stack.join(", ")}`;
  }
  if (has(q, "experience", "work", "career", "job", "role", "history")) {
    return (
      `Shagil has ${profile.experienceYears} across finance, SaaS, CMS and lending:\n\n` +
      experiences
        .sort((a, b) => b.level - a.level)
        .map((e) => `• ${e.role} @ ${e.company} (${e.date})`)
        .join("\n") +
      `\n\nAsk "experience at Yahoo" for details on any role.`
    );
  }

  // skills
  if (has(q, "skill", "tech", "stack", "language", "tool", "framework", "know")) {
    return (
      `Skills arsenal:\n\n` +
      skillCategories
        .map((c) => `${c.label}: ${c.skills.map((s) => s.name).join(", ")}`)
        .join("\n\n")
    );
  }

  // projects
  if (has(q, "project", "built", "build", "portfolio", "lab", "made")) {
    return (
      `Selected projects:\n\n` +
      projects
        .slice(0, 5)
        .map((p) => `• ${p.title} — ${p.impact}`)
        .join("\n") +
      `\n\nThe Projects Lab section has full details on each.`
    );
  }

  // achievements / impact
  if (has(q, "achievement", "impact", "result", "metric", "number", "award")) {
    return (
      `Verified impact:\n\n` +
      achievements.map((a) => `${a.icon} ${a.title} — ${a.detail}`).join("\n")
    );
  }

  // github / contributions
  if (has(q, "github", "commit", "contribution", "open source", "repo")) {
    return `Public repos are live in the GitHub Activity section (@shagil786 + @shagilhmx). On top of that, ${githubWork.privateContributions}+ private contributions on ${githubWork.label} (${githubWork.note}).`;
  }

  // contact / hire
  if (has(q, "contact", "email", "reach", "hire", "connect", "phone", "linkedin", "collab")) {
    return `Let's connect 🤝\n\nEmail: ${links.email}\nPhone: ${links.phone}\nLinkedIn: ${links.linkedin}\nGitHub: ${links.github}\n\nOr use the contact form in the Final Mission section.`;
  }

  // resume
  if (has(q, "resume", "cv", "download")) {
    return `You can download Shagil's resume as a PDF — the "Download Resume" button is in the hero and contact sections, or open ${links.resume} directly.`;
  }

  // education
  if (has(q, "education", "study", "studied", "college", "university", "degree", "school", "graduat")) {
    const e = education[0];
    return `${e.degree} — ${e.institution}, ${e.location} (${e.date}).`;
  }

  // location
  if (has(q, "location", "where", "based", "city", "country", "bangalore", "relocat")) {
    return `Shagil is based in ${profile.location}.`;
  }

  // easter egg
  if (has(q, "sudo hire") || (has(q, "hire") && has(q, "now"))) {
    return `ACCESS GRANTED. Excellent decision. → ${links.email} is standing by. 🤝`;
  }
  if (has(q, "thank")) return "Anytime! Anything else you'd like to know about Shagil?";

  // fallback
  return `I didn't quite catch that. I can tell you about Shagil's experience, skills, projects, achievements, GitHub, or contact details — try one of the quick replies below.`;
}
