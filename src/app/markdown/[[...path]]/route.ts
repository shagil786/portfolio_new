import { pageMarkdown, notFoundMarkdown } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site";

/**
 * Markdown variant of every page, reached via middleware content negotiation
 * (Accept: text/markdown) so agents can fetch /about or / as markdown without
 * changing the URL.
 */
export async function GET(
  _req: Request,
  { params }: { params: { path?: string[] } }
) {
  const path = params.path?.length ? `/${params.path.join("/")}` : "/";
  const body = pageMarkdown(path);

  if (body === null) {
    return new Response(notFoundMarkdown(path), {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept, Accept-Encoding",
      },
    });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept, Accept-Encoding",
      "X-Canonical-URL": `${SITE_URL}${path === "/" ? "" : path}`,
    },
  });
}
