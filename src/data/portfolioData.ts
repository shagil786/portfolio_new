/**
 * portfolioData.ts
 * ----------------
 * Single source of truth for the entire MSN OS portfolio experience.
 * Update content here and it propagates across the 3D world, terminal,
 * recruiter resume view, achievements, and every route.
 */

export interface ProfileData {
  name: string;
  shortName: string;
  role: string;
  altRole: string;
  tagline: string;
  location: string;
  company: string;
  experienceYears: string;
  summary: string;
  specializations: string[];
}

export interface LinkData {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resume: string;
}

export interface Skill {
  name: string;
  /** Symbolic power level 1-100 — visual only, not a literal proficiency claim. */
  power: number;
  blurb: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  level: number;
  company: string;
  role: string;
  date: string;
  theme: string;
  summary: string;
  highlights: string[];
  stack: string[];
  badges: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  problem: string;
  role: string;
  stack: string[];
  impact: string;
  status: "DEPLOYED" | "LIVE" | "SHIPPED";
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  icon: string;
}

export const profile: ProfileData = {
  name: "Md Shagil Nizami",
  shortName: "MSN",
  role: "Software Development Engineer II",
  altRole: "Frontend-heavy Full Stack Developer",
  tagline:
    "Building scalable finance, SaaS, CMS, and micro-frontend systems.",
  location: "Bangalore, India",
  company: "Yahoo",
  experienceYears: "4+ years",
  summary:
    "I build fast, scalable, and user-friendly web products across finance, SaaS, CMS, and lending platforms. My work focuses on performance, reusable architecture, business impact, and clean user experiences.",
  specializations: [
    "React, Next.js, Svelte, TypeScript",
    "SaaS platforms",
    "Finance dashboards",
    "Micro-frontends",
    "CMS modules",
    "Scalable frontend architecture",
    "Full-stack development",
  ],
};

export const links: LinkData = {
  email: "shagilhmx@gmail.com",
  phone: "+91 7975673079",
  github: "https://github.com/shagil786",
  linkedin: "https://www.linkedin.com/in/msn007",
  portfolio: "https://shagilhmx.github.io/portfolio/",
  resume: "/resume.pdf",
};

export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    label: "Languages",
    icon: "{ }",
    color: "neon",
    skills: [
      { name: "TypeScript", power: 94, blurb: "Type-safe systems across the full stack." },
      { name: "JavaScript", power: 95, blurb: "Core language for everything web." },
      { name: "Java", power: 80, blurb: "Backend services & Spring Boot APIs." },
      { name: "C++", power: 74, blurb: "DSA, performance fundamentals." },
      { name: "C", power: 70, blurb: "Systems-level foundations." },
      { name: "HTML5", power: 96, blurb: "Semantic, accessible markup." },
      { name: "CSS3", power: 93, blurb: "Modern layouts, animation, theming." },
      { name: "MySQL", power: 78, blurb: "Relational modeling & queries." },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: "</>",
    color: "neon-2",
    skills: [
      { name: "React", power: 95, blurb: "Component architecture & hooks at scale." },
      { name: "Next.js", power: 92, blurb: "SSR/SSG, app router, performance." },
      { name: "Svelte", power: 82, blurb: "Reactive UI for monetization pages." },
      { name: "Tailwind CSS", power: 93, blurb: "Design systems at velocity." },
      { name: "Webpack", power: 78, blurb: "Bundling & micro-frontend builds." },
      { name: "UI Design", power: 85, blurb: "Clean, premium interface craft." },
      { name: "Flutter", power: 70, blurb: "Cross-platform app surfaces." },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    icon: "[]",
    color: "accent",
    skills: [
      { name: "Node.js", power: 88, blurb: "APIs, tooling, server runtimes." },
      { name: "Express.js", power: 86, blurb: "REST services for dashboards." },
      { name: "Spring Boot", power: 76, blurb: "JVM microservices." },
      { name: "MongoDB", power: 80, blurb: "Document data modeling." },
      { name: "AWS", power: 75, blurb: "Cloud deployment & infra." },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "⚙",
    color: "neon",
    skills: [
      { name: "Git", power: 92, blurb: "Version control workflows." },
      { name: "GitHub", power: 92, blurb: "Collaboration & CI." },
      { name: "Postman", power: 85, blurb: "API testing & docs." },
      { name: "Swagger", power: 84, blurb: "API contracts & schema." },
      { name: "Bitbucket", power: 82, blurb: "Pipelines & deployment." },
      { name: "Jira", power: 80, blurb: "Agile delivery." },
      { name: "VS Code", power: 95, blurb: "Primary editor." },
      { name: "IntelliJ", power: 80, blurb: "JVM development." },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    icon: "▦",
    color: "neon-2",
    skills: [
      { name: "Micro-frontends", power: 90, blurb: "Independent, scalable deployments." },
      { name: "SaaS", power: 88, blurb: "Multi-tenant product platforms." },
      { name: "Full Stack", power: 86, blurb: "End-to-end product delivery." },
      { name: "OOP", power: 85, blurb: "Maintainable system design." },
      { name: "CMS Modules", power: 87, blurb: "Schema-driven content systems." },
      { name: "Reusable Components", power: 92, blurb: "Design-system thinking." },
    ],
  },
];

export const experiences: Experience[] = [
  {
    id: "yahoo",
    level: 4,
    company: "Yahoo",
    role: "Software Development Engineer II",
    date: "Mar 2025 – Present",
    theme: "Finance Command Center",
    summary:
      "Leading the My Money personal finance platform and reusable CMS modules powering millions of linked accounts.",
    highlights: [
      "Led development and enhancement of the My Money personal finance platform supporting 5M+ linked financial accounts.",
      "Improved account-linking workflows, aggregation reliability, error handling, and financial dashboard performance.",
      "Redesigned real-time financial summary components such as net worth, spending insights, and asset allocation.",
      "Built reusable schema-driven modules in Light Year CMS, including the Credit Card Module, reducing publishing time by 40%.",
      "Built a Credit Card Comparison feature with scalable filtering logic.",
      "Migrated and optimized the Yahoo Finance WebView for cross-platform stability and rendering performance.",
      "Built monetization pages with React and Svelte — affiliate tracking, analytics, and Bitbucket pipelines — increasing affiliate conversion and revenue.",
    ],
    stack: ["React", "Svelte", "TypeScript", "Light Year CMS", "Bitbucket", "Analytics"],
    badges: ["5M+ Accounts", "40% Faster Publishing", "Finance Platform"],
  },
  {
    id: "finbox",
    level: 3,
    company: "Finbox",
    role: "Software Engineer",
    date: "Sep 2024 – Feb 2025",
    theme: "Lending Operations Lab",
    summary:
      "Built unified lending dashboards and a micro-frontend architecture for NBFCs and MFLs.",
    highlights: [
      "Developed a unified dashboard for NBFCs and MFLs using Tailwind CSS and Express.js, streamlining financial reporting and reducing navigation time.",
      "Improved loan origination lifecycle flows including underwriting, approvals, and system integrations.",
      "Enhanced the Deviation module for better risk assessment and decision workflows.",
      "Architected a micro-frontend architecture for lending dashboards, reducing duplication and improving deployment independence.",
    ],
    stack: ["Tailwind CSS", "Express.js", "Micro-frontends", "Node.js"],
    badges: ["Micro-Frontend Architect", "Lending Systems"],
  },
  {
    id: "fincity-sde",
    level: 2,
    company: "Fincity",
    role: "Software Development Engineer",
    date: "Nov 2021 – Aug 2024",
    theme: "SaaS Builder Engine",
    summary:
      "Built a low-code SaaS platform and drag-and-drop builder that slashed application and form creation time.",
    highlights: [
      "Built a SaaS platform using Next.js, Tailwind CSS, and Swagger that reduced application development time by 75%.",
      "Designed and built 10 drag-and-drop UI components (TextBox, Dropdown, Button, PhoneNumber), enabling non-technical users to build apps.",
      "Created a Form Storage DnD editor with template and form preview generation, reducing form creation time by 80%.",
      "Added validation framework features with custom validation and eight built-in rules.",
      "Built Cost Sheet and Booking Form modules that improved booking flows and increased booking rates by 30%.",
    ],
    stack: ["Next.js", "Tailwind CSS", "Swagger", "TypeScript", "React DnD"],
    badges: ["75% Faster Apps", "80% Faster Forms", "SaaS Builder"],
  },
  {
    id: "fincity-intern",
    level: 1,
    company: "Fincity",
    role: "Software Developer Intern",
    date: "Apr 2021 – Oct 2021",
    theme: "Authentication Training Ground",
    summary:
      "Optimized authentication flows and core onboarding features for business partners.",
    highlights: [
      "Led optimization of Business Partner authentication flows, reducing load times by 50%, boosting performance by 40%, and improving user satisfaction by 25%.",
      "Improved Sign-in/Sign-up, Walk-in, and Opportunity features, yielding a further 20% performance boost through code optimization.",
    ],
    stack: ["React", "JavaScript", "REST APIs"],
    badges: ["50% Faster Auth"],
  },
];

export const projects: Project[] = [
  {
    id: "my-money",
    title: "Yahoo My Money Platform",
    category: "Finance",
    problem: "Millions of users needed a reliable, real-time view of linked financial accounts.",
    role: "Led development & enhancement of dashboards and account-linking workflows.",
    stack: ["React", "TypeScript", "Svelte", "Analytics"],
    impact: "Supports 5M+ linked financial accounts with improved aggregation reliability.",
    status: "LIVE",
  },
  {
    id: "cc-comparison",
    title: "Credit Card Comparison Engine",
    category: "Finance",
    problem: "Users needed to compare credit cards with flexible, scalable filtering.",
    role: "Built the comparison feature and filtering logic end-to-end.",
    stack: ["React", "TypeScript", "Schema-driven UI"],
    impact: "Scalable filtering powering monetized comparison journeys.",
    status: "LIVE",
  },
  {
    id: "lightyear-cc",
    title: "Light Year CMS — Credit Card Module",
    category: "CMS",
    problem: "Content publishing was slow and repetitive for finance products.",
    role: "Built reusable schema-driven CMS modules.",
    stack: ["Light Year CMS", "React", "TypeScript"],
    impact: "Reduced publishing time by 40% via reusable schema modules.",
    status: "SHIPPED",
  },
  {
    id: "nbfc-dashboard",
    title: "NBFC / MFL Lending Dashboard",
    category: "Lending",
    problem: "NBFCs and MFLs lacked a unified operational view of lending.",
    role: "Developed the unified dashboard and origination flows.",
    stack: ["Tailwind CSS", "Express.js", "Node.js"],
    impact: "Unified loan origination lifecycle with improved decisioning.",
    status: "DEPLOYED",
  },
  {
    id: "loan-mfe",
    title: "Loan Origination Micro-Frontend Platform",
    category: "Architecture",
    problem: "A monolithic lending UI slowed independent team deployments.",
    role: "Architected the micro-frontend system.",
    stack: ["Micro-frontends", "Webpack", "React"],
    impact: "Reduced duplication and enabled independent deployments.",
    status: "DEPLOYED",
  },
  {
    id: "saas-builder",
    title: "SaaS App Builder Platform",
    category: "SaaS",
    problem: "Building new internal apps was slow and inconsistent.",
    role: "Built the low-code SaaS platform.",
    stack: ["Next.js", "Tailwind CSS", "Swagger"],
    impact: "Reduced application development time by 75%.",
    status: "LIVE",
  },
  {
    id: "form-builder",
    title: "Drag-and-Drop Form Builder",
    category: "SaaS",
    problem: "Teams spent excessive time hand-building forms.",
    role: "Created the Form Storage DnD editor with preview generation.",
    stack: ["React DnD", "TypeScript", "Validation Framework"],
    impact: "Reduced form creation time by 80% with a validation framework.",
    status: "SHIPPED",
  },
  {
    id: "cost-sheet",
    title: "Cost Sheet & Booking Form Module",
    category: "SaaS",
    problem: "Booking flows were clunky and converted poorly.",
    role: "Built the Cost Sheet and Booking Form modules.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    impact: "Improved booking flows and increased booking rates by 30%.",
    status: "SHIPPED",
  },
];

export const achievements: Achievement[] = [
  { id: "accounts", title: "5M+ Accounts Supported", detail: "My Money platform scale at Yahoo.", icon: "◈" },
  { id: "publishing", title: "40% Faster Publishing", detail: "Schema-driven Light Year CMS modules.", icon: "⚡" },
  { id: "apps", title: "75% Faster App Development", detail: "Fincity SaaS builder platform.", icon: "🛠" },
  { id: "forms", title: "80% Faster Form Creation", detail: "Drag-and-drop form editor.", icon: "▤" },
  { id: "auth", title: "50% Auth Load-Time Reduction", detail: "Optimized authentication flows.", icon: "🔑" },
  { id: "mfe", title: "Micro-Frontend Architect", detail: "Independent, scalable lending deployments.", icon: "▦" },
  { id: "finance", title: "Finance Platform Builder", detail: "Real-time financial dashboards.", icon: "₿" },
  { id: "saas", title: "SaaS Builder", detail: "Low-code multi-tenant platforms.", icon: "☁" },
];

export interface Education {
  institution: string;
  degree: string;
  date: string;
  location: string;
}

export const education: Education[] = [
  {
    institution: "CMR Institute of Technology",
    degree: "BE in Information Science and Engineering",
    date: "Aug 2017 – Aug 2021",
    location: "Bangalore, India",
  },
];

export const missions = [
  { id: "identity", code: "01", title: "Identity", desc: "Operator profile & dossier" },
  { id: "experience", code: "02", title: "Experience", desc: "Career mission logs" },
  { id: "skills", code: "03", title: "Skills Arsenal", desc: "Weapons & toolkit" },
  { id: "projects", code: "04", title: "Projects Lab", desc: "Deployable modules" },
  { id: "achievements", code: "05", title: "Achievements", desc: "Unlocked records" },
  { id: "contact", code: "06", title: "Contact / Hire Me", desc: "Final mission" },
] as const;

export type MissionId = (typeof missions)[number]["id"];

/**
 * Curated stat for work done on Yahoo's Enterprise (EMU) GitHub, which is
 * SSO-gated and not reachable by the public API. Shown as a clearly-labelled
 * "private" tile alongside the live public heatmap. Update the number to match
 * your profile.
 */
export const githubWork = {
  privateContributions: 619,
  label: "Yahoo Enterprise GitHub",
  note: "Private · yahoo-finance-cloud, yahoo-content-management",
};

export const bootLines = [
  "Initializing MSN OS v4.0...",
  "Loading career modules...",
  "Decrypting experience logs...",
  "Mounting skills arsenal...",
  "Connecting to GitHub...",
  "Verifying credentials [shagil786]...",
  "Access granted.",
];
