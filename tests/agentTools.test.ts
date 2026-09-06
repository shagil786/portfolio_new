import { describe, it, expect } from "vitest";
import {
  AGENT_TOOL_SCHEMAS,
  executeTool,
  formatToolData,
} from "@/lib/agentTools";

describe("AGENT_TOOL_SCHEMAS", () => {
  it("covers the same tools as the site MCP server", () => {
    const names = AGENT_TOOL_SCHEMAS.map((t) => t.name);
    expect(names).toEqual([
      "get_profile",
      "get_experience",
      "get_projects",
      "get_skills",
      "get_achievements",
      "get_education",
      "get_contact",
    ]);
  });

  it("uses closed enum sets so constrained decoding stays valid", () => {
    const experience = AGENT_TOOL_SCHEMAS.find((t) => t.name === "get_experience")!;
    expect(experience.parameters.properties.company?.enum).toEqual([
      "Yahoo",
      "Finbox",
      "Fincity",
    ]);
    const projects = AGENT_TOOL_SCHEMAS.find((t) => t.name === "get_projects")!;
    expect(projects.parameters.properties.category?.enum).toEqual([
      "Finance",
      "SaaS",
      "CMS",
      "Lending",
    ]);
  });
});

describe("executeTool", () => {
  it("filters experience by company, case-insensitively", () => {
    const data = executeTool("get_experience", { company: "finbox" }) as {
      roles: Array<{ company: string }>;
    };
    expect(data.roles).toHaveLength(1);
    expect(data.roles[0].company).toBe("Finbox");
  });

  it("falls back to all roles for an unknown company", () => {
    const data = executeTool("get_experience", { company: "Nonexistent" }) as {
      roles: Array<{ company: string }>;
    };
    expect(data.roles.length).toBeGreaterThan(1);
  });

  it("filters projects by category", () => {
    const data = executeTool("get_projects", { category: "Finance" }) as {
      projects: Array<{ category: string }>;
    };
    expect(data.projects.length).toBeGreaterThan(0);
    for (const p of data.projects) expect(p.category).toBe("Finance");
  });

  it("returns contact details", () => {
    const data = executeTool("get_contact") as { email: string };
    expect(data.email).toBe("shagilhmx@gmail.com");
  });

  it("marks unknown tools with an error instead of throwing", () => {
    expect(executeTool("delete_everything")).toEqual({
      error: "unknown tool: delete_everything",
    });
  });
});

describe("formatToolData", () => {
  it("formats experience as human-readable bullet lines", () => {
    const text = formatToolData("get_experience", executeTool("get_experience", { company: "Yahoo" }));
    expect(text).toContain("Yahoo");
    expect(text).toContain("•");
  });

  it("returns empty string for error payloads", () => {
    expect(formatToolData("get_profile", { error: "boom" })).toBe("");
  });
});
