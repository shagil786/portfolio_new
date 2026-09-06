import {
  profile,
  links,
  experiences,
  projects,
  skillCategories,
  achievements,
  education,
} from "@/data/portfolioData";

/**
 * Minimal Model Context Protocol server (Streamable HTTP, JSON-RPC 2.0),
 * implemented without an SDK so it runs stateless on serverless.
 * Spec: https://modelcontextprotocol.io — POST JSON-RPC messages; notifications
 * get 202; GET returns 405 because we do not offer an SSE stream.
 */

const LATEST_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
];

const SERVER_INFO = {
  name: "msn-os-portfolio",
  title: "MSN OS — Md Shagil Nizami portfolio",
  version: "1.0.0",
};

const SERVER_INSTRUCTIONS =
  "Read-only tools for the portfolio of Md Shagil Nizami (MSN OS). Use get_profile for identity, get_experience for work history, get_projects for shipped work, get_skills for the stack, get_achievements for measurable wins, get_education for degrees, and get_contact for how to reach him. All data is public, unauthenticated, and safe to quote.";

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, never>; required: string[] };
};

const TOOLS: ToolDefinition[] = [
  { name: "get_profile", description: `Identity and summary for ${profile.name} — role, employer, location, specializations.`, inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_experience", description: "Work history with dates, summaries, highlights, and stacks.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_projects", description: "Shipped projects with problem, role, impact, and stack.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_skills", description: "Skill categories with per-skill notes.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_achievements", description: "Measurable career achievements.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_education", description: "Education history.", inputSchema: { type: "object", properties: {}, required: [] } },
  { name: "get_contact", description: `Contact details: email, phone, GitHub, LinkedIn.`, inputSchema: { type: "object", properties: {}, required: [] } },
];

function toolText(name: string): string {
  switch (name) {
    case "get_profile":
      return JSON.stringify(
        {
          name: profile.name,
          shortName: profile.shortName,
          role: profile.role,
          altRole: profile.altRole,
          company: profile.company,
          location: profile.location,
          experienceYears: profile.experienceYears,
          summary: profile.summary,
          specializations: profile.specializations,
          site: links.portfolio,
        },
        null,
        2
      );
    case "get_experience":
      return JSON.stringify(
        experiences.map(({ company, role, date, summary, highlights, stack }) => ({
          company, role, date, summary, highlights, stack,
        })),
        null,
        2
      );
    case "get_projects":
      return JSON.stringify(
        projects.map(({ title, category, problem, role, stack, impact, status }) => ({
          title, category, problem, role, stack, impact, status,
        })),
        null,
        2
      );
    case "get_skills":
      return JSON.stringify(
        skillCategories.map((c) => ({
          category: c.label,
          skills: c.skills.map((s) => s.name),
        })),
        null,
        2
      );
    case "get_achievements":
      return JSON.stringify(
        achievements.map(({ title, detail }) => ({ title, detail })),
        null,
        2
      );
    case "get_education":
      return JSON.stringify(education, null, 2);
    case "get_contact":
      return JSON.stringify(
        {
          email: links.email,
          phone: links.phone,
          github: links.github,
          linkedin: links.linkedin,
          site: links.portfolio,
        },
        null,
        2
      );
    default:
      return "";
  }
}

export type JsonRpcResponse = { status: number; body: unknown };

function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return { status: 200, body: { jsonrpc: "2.0", id, result } };
}

function err(
  id: string | number | null,
  code: number,
  message: string
): JsonRpcResponse {
  return {
    status: 200,
    body: { jsonrpc: "2.0", id, error: { code, message } },
  };
}

/**
 * Handles one parsed JSON-RPC message. Returns the HTTP status and body (or a
 * 202/204 status with a null body for notifications).
 */
export function handleMcpMessage(
  message: unknown
): JsonRpcResponse {
  if (
    typeof message !== "object" ||
    message === null ||
    (message as Record<string, unknown>).jsonrpc !== "2.0" ||
    typeof (message as Record<string, unknown>).method !== "string"
  ) {
    return err(null, -32600, "Invalid Request: expected a JSON-RPC 2.0 message");
  }

  const { method, id, params } = message as {
    method: string;
    id?: string | number | null;
    params?: Record<string, unknown>;
  };

  if (id === undefined) {
    // Notification — accepted, never answered (except HTTP 202).
    return { status: 202, body: null };
  }

  switch (method) {
    case "initialize": {
      const requested = (params as { protocolVersion?: string } | undefined)
        ?.protocolVersion;
      const protocolVersion =
        requested && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
          ? requested
          : LATEST_PROTOCOL_VERSION;
      return ok(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: SERVER_INSTRUCTIONS,
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const name =
        typeof params?.name === "string" ? params.name : undefined;
      if (!name || !TOOLS.some((t) => t.name === name)) {
        return err(id, -32602, `Unknown tool: ${String(params?.name ?? "")}`);
      }
      return ok(id, {
        content: [{ type: "text", text: toolText(name) }],
      });
    }
    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}
