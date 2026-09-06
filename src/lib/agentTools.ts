import {
  profile,
  links,
  experiences,
  projects,
  skillCategories,
  achievements,
  education,
  githubWork,
  type MissionId,
} from "@/data/portfolioData";
import { useGameStore, type ThemeName } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";

/**
 * Tool surface for the on-device MSN AI (Needle 2 WASM engine).
 * Needle decides WHICH tool to call and with what arguments; these pure
 * functions execute against portfolioData and format the reply, so model
 * output never reaches the visitor without deterministic validation.
 *
 * The same tool names/schemas are exposed via the site MCP server.
 */

export type ToolKind = "read" | "action";

export interface ToolSchema {
  name: string;
  kind: ToolKind;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required: string[];
  };
}

export const AGENT_TOOL_SCHEMAS: ToolSchema[] = [
  {
    name: "get_profile",
    kind: "read",
    description:
      "Get who Md Shagil Nizami is: current role, employer, location, years of experience, and summary. Use for 'who is', 'about', 'introduce' questions.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_experience",
    kind: "read",
    description:
      "Get EMPLOYMENT HISTORY: job titles, employers, dates, responsibilities, achievements at work. Use for questions like 'what did he do at Yahoo', 'where has he worked', 'his role at Finbox', 'work experience', 'career'. Pass company: Yahoo, Finbox, or Fincity. Omit company for the full career list.",
    parameters: {
      type: "object",
      properties: {
        company: {
          type: "string",
          enum: ["Yahoo", "Finbox", "Fincity"],
          description: "Employer to look up. Omit for all roles.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_projects",
    kind: "read",
    description:
      "Get software PROJECTS and apps he built, with problem and measured impact. Use for questions like 'show me his projects', 'what has he built', 'portfolio demos'. Pass category: Finance, SaaS, CMS, or Lending. Omit category for all projects.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["Finance", "SaaS", "CMS", "Lending"],
          description: "Project category filter. Omit for all.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_skills",
    kind: "read",
    description:
      "Get the tech skills grouped by category: Languages, Frontend, Backend, Tools, Architecture. Use for 'skills', 'stack', 'what does he know'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_achievements",
    kind: "read",
    description:
      "Get measurable career achievements with numbers: accounts supported, publishing speed, build speed, auth performance. Use for 'impact', 'metrics', 'results'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_education",
    kind: "read",
    description: "Get the university degree and dates. Use for 'education', 'college', 'degree'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_contact",
    kind: "read",
    description:
      "Get contact details: email, phone, LinkedIn, GitHub, and the resume PDF link. Use for 'contact', 'email', 'hire', 'reach', 'resume'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "set_theme",
    kind: "action",
    description:
      "Change the site's COLOR THEME. Values: green (Hacker Green, the default), purple (Cyber Purple), blue (Finance Blue). Use for 'change the color', 'make it purple', 'switch to blue theme'.",
    parameters: {
      type: "object",
      properties: {
        theme: {
          type: "string",
          enum: ["green", "purple", "blue"],
          description: "The theme to apply.",
        },
      },
      required: ["theme"],
    },
  },
  {
    name: "set_muted",
    kind: "action",
    description:
      "Turn the site's terminal SOUND EFFECTS on or off. Use for 'mute the sounds', 'turn the sound on', 'silence', 'unmute'.",
    parameters: {
      type: "object",
      properties: {
        sound: {
          type: "string",
          enum: ["on", "off"],
          description: "'on' plays sound effects; 'off' mutes them.",
        },
      },
      required: ["sound"],
    },
  },
  {
    name: "open_section",
    kind: "action",
    description:
      "Scroll the site to one of its sections. Use for 'open the projects section', 'show me the experience', 'go to contact'.",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["identity", "experience", "skills", "projects", "achievements", "contact"],
          description: "The section to open.",
        },
      },
      required: ["section"],
    },
  },
  {
    name: "toggle_recruiter",
    kind: "action",
    description:
      "Switch the whole site into clean RECRUITER VIEW (a plain scannable resume instead of the interactive command center), or back. Use for 'recruiter mode', 'simple resume view', 'back to the terminal'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
];

export function executeTool(name: string, args: Record<string, unknown> = {}): unknown {
  switch (name) {
    case "get_profile":
      return {
        name: profile.name,
        role: profile.role,
        company: profile.company,
        location: profile.location,
        experienceYears: profile.experienceYears,
        summary: profile.summary,
      };
    case "get_experience": {
      const wanted = typeof args.company === "string" ? args.company.toLowerCase() : null;
      const matches = experiences.filter((e) => e.company.toLowerCase() === wanted);
      const list = matches.length ? matches : experiences;
      return {
        roles: list.map((e) => ({
          role: e.role,
          company: e.company,
          date: e.date,
          summary: e.summary,
          highlights: e.highlights.slice(0, 3),
          stack: e.stack,
        })),
      };
    }
    case "get_projects": {
      const wanted = typeof args.category === "string" ? args.category.toLowerCase() : null;
      const matches = projects.filter((p) => p.category.toLowerCase() === wanted);
      const list = matches.length ? matches : projects;
      return {
        projects: list.map((p) => ({
          title: p.title,
          category: p.category,
          problem: p.problem,
          impact: p.impact,
          stack: p.stack,
        })),
      };
    }
    case "get_skills":
      return {
        categories: skillCategories.map((c) => ({
          label: c.label,
          skills: c.skills.map((s) => s.name),
        })),
      };
    case "get_achievements":
      return {
        achievements: achievements.map((a) => ({ title: a.title, detail: a.detail })),
        privateWork: `${githubWork.privateContributions}+ contributions on ${githubWork.label}`,
      };
    case "get_education":
      return { education };
    case "get_contact":
      return {
        email: links.email,
        phone: links.phone,
        linkedin: links.linkedin,
        github: links.github,
        resume: links.resume,
      };
    // Action tools — the model can operate the site, not just read it.
    // Mutations go through the same zustand store the UI buttons use, so the
    // bot can never set state the UI itself couldn't. Args are re-validated
    // here (defense-in-depth under governance) so execution never throws.
    case "set_theme": {
      const theme = args.theme as ThemeName;
      if (!theme || !THEMES[theme]) return { error: `invalid theme: ${String(args.theme)}` };
      useGameStore.getState().setTheme(theme);
      return { theme, label: THEMES[theme].label };
    }
    case "set_muted": {
      if (args.sound !== "on" && args.sound !== "off") {
        return { error: `invalid sound: ${String(args.sound)}` };
      }
      const muted = args.sound === "off";
      if (useGameStore.getState().muted !== muted) {
        useGameStore.getState().toggleMute();
      }
      return { muted };
    }
    case "open_section": {
      const section = args.section as MissionId;
      const valid: string[] = ["identity", "experience", "skills", "projects", "achievements", "contact"];
      if (!section || !valid.includes(section)) {
        return { error: `invalid section: ${String(args.section)}` };
      }
      useGameStore.getState().setActiveSection(section);
      if (typeof document !== "undefined") {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      }
      return { section };
    }
    case "toggle_recruiter": {
      useGameStore.getState().toggleRecruiter();
      return { recruiterMode: useGameStore.getState().recruiterMode };
    }
    default:
      return { error: `unknown tool: ${name}` };
  }
}

export function formatToolData(name: string, data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in (data as Record<string, unknown>)
  ) {
    return "";
  }
  switch (name) {
    case "get_profile":
      return `${profile.name} is a ${profile.role} at ${profile.company}, based in ${profile.location} (${profile.experienceYears}).\n\n${profile.summary}`;
    case "get_experience": {
      const { roles } = data as { roles: Array<Record<string, unknown>> };
      return roles
        .map(
          (r) =>
            `• ${r.role} @ ${r.company} (${r.date})\n  ${r.summary}\n${(r.highlights as string[])
              .map((h) => `   - ${h}`)
              .join("\n")}`
        )
        .join("\n\n");
    }
    case "get_projects": {
      const { projects: list } = data as { projects: Array<Record<string, unknown>> };
      return (
        "Selected projects:\n\n" +
        list.map((p) => `• ${p.title} (${p.category}) — ${p.impact}`).join("\n")
      );
    }
    case "get_skills": {
      const { categories } = data as { categories: Array<{ label: string; skills: string[] }> };
      return (
        "Skills arsenal:\n\n" +
        categories.map((c) => `${c.label}: ${c.skills.join(", ")}`).join("\n\n")
      );
    }
    case "get_achievements": {
      const { achievements: list, privateWork } = data as {
        achievements: Array<{ title: string; detail: string }>;
        privateWork: string;
      };
      return (
        list.map((a) => `• ${a.title} — ${a.detail}`).join("\n") + `\n\n${privateWork}`
      );
    }
    case "get_education": {
      const { education: list } = data as {
        education: Array<{ degree: string; institution: string; date: string }>;
      };
      return list.map((e) => `${e.degree} — ${e.institution} (${e.date})`).join("\n");
    }
    case "get_contact":
      return `Let's connect:\n\nEmail: ${links.email}\nPhone: ${links.phone}\nLinkedIn: ${links.linkedin}\nGitHub: ${links.github}\nResume: ${links.resume}`;
    case "set_theme": {
      const { label } = data as { label: string };
      return `Theme switched to ${label}. 🎨`;
    }
    case "set_muted": {
      const { muted } = data as { muted: boolean };
      return muted ? "Sound effects muted. 🔇" : "Sound effects on. 🔊";
    }
    case "open_section": {
      const { section } = data as { section: string };
      return `Opening the ${section} section. ▸`;
    }
    case "toggle_recruiter": {
      const { recruiterMode } = data as { recruiterMode: boolean };
      return recruiterMode
        ? "Recruiter view on — clean resume mode."
        : "Back to the interactive command center.";
    }
    default:
      return "";
  }
}
