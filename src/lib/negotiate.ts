/**
 * Pure content-negotiation logic, extracted so it can be unit-tested.
 * An agent explicitly sending Accept: text/markdown gets the markdown variant
 * of the same URL; everything else keeps the HTML app.
 */
export function wantsMarkdown(acceptHeader: string | null | undefined): boolean {
  if (!acceptHeader) return false;
  return acceptHeader
    .toLowerCase()
    .split(",")
    .some((part) => {
      const type = part.trim().split(";")[0].trim();
      return type === "text/markdown";
    });
}

/** Paths that should never be negotiated to markdown (APIs, assets, files). */
export function isExcludedFromNegotiation(pathname: string): boolean {
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) return true;
  // Anything with a file extension (resume.pdf, sitemap.xml, icon.svg, …)
  const last = pathname.slice(pathname.lastIndexOf("/") + 1);
  return last.includes(".");
}
