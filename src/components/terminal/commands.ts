import {
  profile,
  links,
  skillCategories,
  experiences,
  projects,
  achievements,
} from "@/data/portfolioData";

export interface TerminalLine {
  type: "in" | "out" | "ok" | "err" | "warn" | "link";
  text: string;
  href?: string;
}

export interface CommandContext {
  unlockAll: () => void;
  clear: () => void;
  openResume: () => void;
  setHireMode: (v: boolean) => void;
}

const HELP: TerminalLine[] = [
  { type: "out", text: "Available commands:" },
  { type: "out", text: "  help                 show this help" },
  { type: "out", text: "  about                operator profile" },
  { type: "out", text: "  experience [company] career logs (e.g. experience yahoo)" },
  { type: "out", text: "  skills [category]    skills arsenal" },
  { type: "out", text: "  projects             deployable modules" },
  { type: "out", text: "  achievements         unlocked records" },
  { type: "out", text: "  contact              contact details" },
  { type: "out", text: "  github | linkedin    open links" },
  { type: "out", text: "  resume               download resume" },
  { type: "out", text: "  unlock all           unlock every mission" },
  { type: "out", text: "  clear                clear the terminal" },
  { type: "warn", text: "  (psst… some commands are hidden. try `sudo hire shagil`)" },
];

export function runCommand(raw: string, ctx: CommandContext): TerminalLine[] {
  const input = raw.trim();
  const [cmd, ...args] = input.toLowerCase().split(/\s+/);
  const arg = args.join(" ");

  switch (cmd) {
    case "":
      return [];
    case "help":
    case "?":
      return HELP;

    case "about":
      return [
        { type: "ok", text: profile.name + " — " + profile.role },
        { type: "out", text: `${profile.altRole} · ${profile.location}` },
        { type: "out", text: profile.summary },
      ];

    case "whoami":
      return [{ type: "ok", text: `${profile.shortName.toLowerCase()}@msn-os (operator)` }];

    case "skills": {
      if (arg) {
        const cat = skillCategories.find((c) => c.id === arg || c.label.toLowerCase() === arg);
        if (cat) {
          return [
            { type: "ok", text: `${cat.label}:` },
            { type: "out", text: "  " + cat.skills.map((s) => s.name).join(", ") },
          ];
        }
        return [{ type: "err", text: `Unknown category: ${arg}` }];
      }
      return skillCategories.flatMap((c) => [
        { type: "ok" as const, text: `${c.label}:` },
        { type: "out" as const, text: "  " + c.skills.map((s) => s.name).join(", ") },
      ]);
    }

    case "experience":
    case "exp": {
      if (arg) {
        const exp = experiences.find(
          (e) => e.company.toLowerCase().includes(arg) || e.id.includes(arg)
        );
        if (exp) {
          return [
            { type: "ok", text: `L${exp.level} · ${exp.role} @ ${exp.company} (${exp.date})` },
            { type: "warn", text: `[${exp.theme}]` },
            ...exp.highlights.map((h) => ({ type: "out" as const, text: "  ▹ " + h })),
            { type: "out", text: "  stack: " + exp.stack.join(", ") },
          ];
        }
        return [{ type: "err", text: `No mission log for: ${arg}` }];
      }
      return [...experiences]
        .sort((a, b) => b.level - a.level)
        .map((e) => ({
          type: "out" as const,
          text: `  L${e.level}  ${e.company.padEnd(9)} ${e.role} · ${e.date}`,
        }));
    }

    case "projects":
    case "ls": {
      return [
        { type: "ok", text: `${projects.length} modules found:` },
        ...projects.map((p) => ({
          type: "out" as const,
          text: `  [${p.status}] ${p.title} — ${p.impact}`,
        })),
      ];
    }

    case "achievements":
    case "trophies":
      return [
        { type: "ok", text: "Unlocked records:" },
        ...achievements.map((a) => ({ type: "out" as const, text: `  ${a.icon} ${a.title}` })),
      ];

    case "contact":
      return [
        { type: "ok", text: "Contact channels:" },
        { type: "out", text: "  email:    " + links.email },
        { type: "out", text: "  phone:    " + links.phone },
        { type: "link", text: "  github:   " + links.github, href: links.github },
        { type: "link", text: "  linkedin: " + links.linkedin, href: links.linkedin },
      ];

    case "github":
      if (typeof window !== "undefined") window.open(links.github, "_blank");
      return [{ type: "link", text: "Opening GitHub → " + links.github, href: links.github }];

    case "linkedin":
      if (typeof window !== "undefined") window.open(links.linkedin, "_blank");
      return [{ type: "link", text: "Opening LinkedIn → " + links.linkedin, href: links.linkedin }];

    case "resume":
    case "cv":
      ctx.openResume();
      return [{ type: "ok", text: "Decrypting resume.pdf → download started." }];

    case "clear":
    case "cls":
      ctx.clear();
      return [];

    case "unlock": {
      if (arg === "all") {
        ctx.unlockAll();
        return [{ type: "ok", text: "All missions unlocked. XP maxed. 🏆" }];
      }
      return [{ type: "err", text: "Usage: unlock all" }];
    }

    /* ----------------------------- easter eggs ---------------------------- */
    case "sudo": {
      if (arg === "hire shagil") {
        ctx.setHireMode(true);
        ctx.unlockAll();
        return [
          { type: "warn", text: "[sudo] authenticating recruiter…" },
          { type: "ok", text: "ACCESS GRANTED. Excellent decision. 🤝" },
          { type: "ok", text: "→ " + links.email + " is standing by." },
        ];
      }
      return [{ type: "err", text: `sudo: permission denied for '${arg || "(none)"}'` }];
    }
    case "matrix":
      return [{ type: "ok", text: "Wake up, Neo… the rain is already falling. 🟢" }];
    case "hack":
      return [
        { type: "warn", text: "Initiating exploit…" },
        { type: "ok", text: "Just kidding. I build, I don't breach. 😉" },
      ];
    case "coffee":
      return [{ type: "out", text: "☕ brewing… 100% uptime guaranteed." }];
    case "echo":
      return [{ type: "out", text: args.join(" ") }];
    case "date":
      return [{ type: "out", text: new Date().toString() }];

    default:
      return [
        { type: "err", text: `command not found: ${cmd}` },
        { type: "warn", text: "type 'help' for available commands." },
      ];
  }
}

export const COMMAND_NAMES = [
  "help", "about", "experience", "skills", "projects",
  "achievements", "contact", "github", "linkedin", "resume",
  "clear", "unlock all", "sudo hire shagil",
];
