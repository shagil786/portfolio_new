import { SITE_URL, SITE_NAME } from "@/lib/site";

/** OpenAPI 3.1 contract for the site's public JSON API. */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} — Md Shagil Nizami portfolio API`,
      version: "1.0.0",
      description:
        "Public, unauthenticated JSON API for the MSN OS portfolio of Md Shagil Nizami: GitHub data, live presence, and a contact endpoint. Portfolio content is also available as markdown (Accept: text/markdown) and via MCP at /.well-known/mcp.",
      contact: { name: "Md Shagil Nizami", email: "shagilhmx@gmail.com", url: SITE_URL },
      license: { name: "MIT" },
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/github": {
        get: {
          operationId: "getGithubData",
          summary: "Public repos and contribution calendar",
          description:
            "Returns up to 9 non-fork public repositories sorted by stars/recency and a merged 53-week contribution calendar.",
          responses: {
            "200": {
              description: "GitHub snapshot",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      repos: {
                        type: ["array", "null"],
                        items: { $ref: "#/components/schemas/Repo" },
                      },
                      contributions: {
                        type: ["object", "null"],
                        properties: {
                          total: { type: "integer" },
                          weeks: {
                            type: "array",
                            items: {
                              type: "array",
                              items: { $ref: "#/components/schemas/ContributionDay" },
                            },
                          },
                        },
                      },
                      usernames: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/presence": {
        get: {
          operationId: "getPresence",
          summary: "Count of visitors currently online",
          responses: {
            "200": {
              description: "Current online count",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { count: { type: "integer", minimum: 0 } },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: "heartbeatPresence",
          summary: "Presence heartbeat",
          description:
            "Send a randomly generated browser session id every ~12 seconds; the id is anonymous and expires after 30 seconds of inactivity.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated online count",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { count: { type: "integer", minimum: 0 } },
                  },
                },
              },
            },
          },
        },
      },
      "/api/contact": {
        post: {
          operationId: "sendContactMessage",
          summary: "Send a contact message",
          description:
            "Forwards a message by email to the site owner. Returns 503 with { fallback: true } when email delivery is not configured; fall back to emailing shagilhmx@gmail.com directly.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "message"],
                  properties: {
                    name: { type: "string", maxLength: 200 },
                    email: { type: "string", format: "email" },
                    message: { type: "string", maxLength: 5000 },
                    company: {
                      type: "string",
                      description: "Honeypot field — must stay empty.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Message delivered",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { ok: { type: "boolean" } } },
                },
              },
            },
            "400": { description: "Missing or invalid fields" },
            "502": { description: "Email provider error" },
            "503": {
              description: "Email delivery not configured — use the fallback address",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Repo: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            html_url: { type: "string", format: "uri" },
            description: { type: ["string", "null"] },
            stargazers_count: { type: "integer" },
            language: { type: ["string", "null"] },
            updated_at: { type: "string", format: "date-time" },
            fork: { type: "boolean" },
            account: { type: "string" },
          },
        },
        ContributionDay: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            count: { type: "integer" },
            level: { type: "integer", minimum: 0, maximum: 4 },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
