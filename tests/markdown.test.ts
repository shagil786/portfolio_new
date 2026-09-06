import { describe, it, expect } from "vitest";
import { pageMarkdown, notFoundMarkdown, homeMarkdown } from "@/lib/markdown";
import { ROUTES } from "@/lib/site";

describe("pageMarkdown", () => {
  it("renders markdown for every crawlable route", () => {
    for (const route of ROUTES) {
      expect(pageMarkdown(route), `missing markdown for ${route}`).not.toBeNull();
    }
    expect(pageMarkdown("/")).toBe(pageMarkdown(""));
  });

  it("returns null for unknown routes", () => {
    expect(pageMarkdown("/does-not-exist")).toBeNull();
  });

  it("home markdown has an H1, when-to-use guidance, and substantial content", () => {
    const md = homeMarkdown();
    expect(md.startsWith("# Md Shagil Nizami")).toBe(true);
    expect(md).toContain("## When to use this site");
    expect(md.length).toBeGreaterThan(2000);
    expect(md).toContain("## Experience");
    expect(md).toContain("## Skills");
    expect(md).toContain("## Contact");
  });

  it("home markdown is deterministic", () => {
    expect(homeMarkdown()).toBe(homeMarkdown());
  });

  it("markdown pages include the site map for recovery", () => {
    expect(homeMarkdown()).toContain("## Site map");
  });
});

describe("notFoundMarkdown", () => {
  it("includes the missed path, site map links, and next steps", () => {
    const md = notFoundMarkdown("/some-missing-path");
    expect(md).toContain("/some-missing-path");
    expect(md).toContain("## Site map");
    expect(md).toContain("(https://");
    expect(md).toContain("/llms.txt");
    expect(md).toContain("/sitemap.xml");
    expect(md).toContain("/docs");
  });
});
