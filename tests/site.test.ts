import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROUTES, SITE_URL } from "@/lib/site";

describe("site config", () => {
  it("lists the trust and developer pages as crawlable routes", () => {
    expect(ROUTES).toContain("/about");
    expect(ROUTES).toContain("/privacy");
    expect(ROUTES).toContain("/docs");
    expect(ROUTES).toContain("/contact");
  });

  it("uses the deployed domain as the canonical origin", () => {
    expect(SITE_URL).toMatch(/^https:\/\/portfolio-new-eta-tawny\.vercel\.app$/);
  });
});

describe("public agent files", () => {
  const llms = readFileSync(join(__dirname, "..", "public", "llms.txt"), "utf8");

  it("llms.txt has when-to-use guidance, not just marketing", () => {
    expect(llms).toContain("# MSN OS");
    expect(llms).toContain("## When to use this site");
    expect(llms).toContain("How to fetch content");
  });

  it("llms.txt indexes the developer resources by name", () => {
    expect(llms).toContain("/docs");
    expect(llms).toContain("/openapi.json");
    expect(llms).toContain("/.well-known/mcp");
    expect(llms).toContain("/sitemap.xml");
  });

  it("llms.txt documents the markdown negotiation and MCP tools", () => {
    expect(llms).toContain("Accept: text/markdown");
    expect(llms).toContain("tools/call");
    expect(llms).toContain("get_profile");
  });
});
