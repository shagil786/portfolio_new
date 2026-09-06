import { describe, it, expect } from "vitest";
import { queryGraph, relatedLine, buildGraph } from "@/lib/agent/graph";

describe("knowledge graph", () => {
  it("builds a graph with the person, employers, projects, and skills", () => {
    const { nodes, edges } = buildGraph();
    const kinds = new Set(nodes.map((n) => n.kind));
    expect(kinds).toEqual(new Set(["person", "employer", "project", "skill-category", "education"]));
    expect(edges.length).toBeGreaterThan(10);
  });

  it("answers entity queries with related facts", () => {
    const related = queryGraph("finbox");
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((e) => e.relation.includes("Software Engineer"))).toBe(true);
  });

  it("returns nothing for empty or unknown queries", () => {
    expect(queryGraph("")).toEqual([]);
    expect(relatedLine("xyzzy-nothing")).toBeNull();
  });

  it("relatedLine renders a single enrichment line", () => {
    const line = relatedLine("finbox");
    expect(line).toMatch(/^Related: /);
    expect(line?.split("\n")).toHaveLength(1);
  });
});
