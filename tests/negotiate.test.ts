import { describe, it, expect } from "vitest";
import { wantsMarkdown, isExcludedFromNegotiation } from "@/lib/negotiate";

describe("wantsMarkdown", () => {
  it("matches an explicit text/markdown request", () => {
    expect(wantsMarkdown("text/markdown")).toBe(true);
  });

  it("matches text/markdown among other types", () => {
    expect(wantsMarkdown("text/html,application/xhtml+xml,text/markdown;q=0.9,*/*;q=0.8")).toBe(true);
  });

  it("does not match HTML or wildcard-only agents", () => {
    expect(wantsMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe(false);
    expect(wantsMarkdown("*/*")).toBe(false);
    expect(wantsMarkdown(null)).toBe(false);
    expect(wantsMarkdown(undefined)).toBe(false);
  });
});

describe("isExcludedFromNegotiation", () => {
  it("excludes API and framework paths", () => {
    expect(isExcludedFromNegotiation("/api/github")).toBe(true);
    expect(isExcludedFromNegotiation("/api/mcp")).toBe(true);
    expect(isExcludedFromNegotiation("/_next/static/chunk.js")).toBe(true);
  });

  it("excludes file paths but not pages", () => {
    expect(isExcludedFromNegotiation("/resume.pdf")).toBe(true);
    expect(isExcludedFromNegotiation("/sitemap.xml")).toBe(true);
    expect(isExcludedFromNegotiation("/llms.txt")).toBe(true);
    expect(isExcludedFromNegotiation("/openapi.json")).toBe(true);
    expect(isExcludedFromNegotiation("/")).toBe(false);
    expect(isExcludedFromNegotiation("/about")).toBe(false);
    expect(isExcludedFromNegotiation("/some-missing-path")).toBe(false);
  });
});
