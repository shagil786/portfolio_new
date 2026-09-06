import { NextResponse, type NextRequest } from "next/server";
import { wantsMarkdown, isExcludedFromNegotiation } from "@/lib/negotiate";

/**
 * Markdown content negotiation + cache correctness.
 *
 * - `Accept: text/markdown` on a page URL rewrites to the markdown variant
 *   served by /markdown/[[...path]].
 * - Every negotiated page response carries `Vary: Accept, Accept-Encoding`
 *   so CDNs never serve the cached HTML variant to an agent asking for
 *   markdown (or vice versa).
 */
const VARY = "Accept, Accept-Encoding";

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept");
  const path = req.nextUrl.pathname;

  if (wantsMarkdown(accept) && !isExcludedFromNegotiation(path)) {
    const res = NextResponse.rewrite(
      new URL(`/markdown${path === "/" ? "" : path}`, req.url)
    );
    res.headers.set("Vary", VARY);
    return res;
  }

  const res = NextResponse.next();
  if (!isExcludedFromNegotiation(path)) {
    res.headers.set("Vary", VARY);
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
