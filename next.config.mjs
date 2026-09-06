/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/drei"],
  },
  async rewrites() {
    return [
      // Dot-prefixed directories are not routable in the app router, so the
      // MCP Streamable HTTP server is mounted at /api/mcp and exposed here.
      { source: "/.well-known/mcp", destination: "/api/mcp" },
    ];
  },
  async headers() {
    return [
      {
        // Pages can serve HTML or markdown for the same URL (Accept
        // negotiation in src/middleware.ts) — caches must keep the variants
        // apart or agents may receive the cached HTML variant.
        source: "/:path*",
        headers: [{ key: "Vary", value: "Accept, Accept-Encoding" }],
      },
    ];
  },
};

export default nextConfig;
