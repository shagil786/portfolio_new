import {
  profile,
  experiences,
  projects,
  skillCategories,
  education,
} from "@/data/portfolioData";

/**
 * Execution layer — a tiny portfolio knowledge graph.
 *
 * Nodes are the entities of the resume (person, employers, projects, skill
 * categories, education); edges are the relations between them. The routing
 * model never queries it directly: after a tool call produces the primary
 * answer, related-graph facts can enrich it with one contextual line, and the
 * scripted fallback path can use it when no tool was called.
 */

export type NodeKind = "person" | "employer" | "project" | "skill-category" | "education";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

let cached: { nodes: GraphNode[]; edges: GraphEdge[] } | null = null;

export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (cached) return cached;

  const nodes: GraphNode[] = [
    { id: "person", kind: "person", label: profile.name },
  ];
  const edges: GraphEdge[] = [];

  for (const e of experiences) {
    nodes.push({ id: `employer:${e.company}`, kind: "employer", label: e.company });
    edges.push({ from: "person", to: `employer:${e.company}`, relation: `works as ${e.role} (${e.date})` });
  }

  for (const p of projects) {
    nodes.push({ id: `project:${p.title}`, kind: "project", label: p.title });
    edges.push({ from: "person", to: `project:${p.title}`, relation: `built (${p.impact})` });
  }

  for (const c of skillCategories) {
    nodes.push({ id: `skills:${c.label}`, kind: "skill-category", label: c.label });
    edges.push({ from: "person", to: `skills:${c.label}`, relation: `skilled in ${c.skills.map((s) => s.name).join(", ")}` });
  }

  for (const e of education) {
    nodes.push({ id: `education:${e.institution}`, kind: "education", label: e.institution });
    edges.push({ from: "person", to: `education:${e.institution}`, relation: `studied ${e.degree} (${e.date})` });
  }

  cached = { nodes, edges };
  return cached;
}

/**
 * Returns edges touching an entity whose label or id matches the query, so a
 * question about "finbox" can surface related facts the primary tool missed.
 */
export function queryGraph(query: string): GraphEdge[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return [];
  const { edges, nodes } = buildGraph();
  const matchedIds = new Set(
    nodes
      .filter(
        (n) =>
          n.id !== "person" &&
          tokens.some((t) => n.label.toLowerCase().includes(t) || n.id.toLowerCase().includes(t))
      )
      .map((n) => n.id)
  );
  return edges.filter((e) => matchedIds.has(e.from) || matchedIds.has(e.to)).slice(0, 5);
}

/** One-line enrichment for an answer, or null when the graph adds nothing. */
export function relatedLine(query: string): string | null {
  const related = queryGraph(query);
  if (related.length === 0) return null;
  const facts = related.map((e) => `${e.relation}`).join("; ");
  return `Related: ${facts}`;
}
