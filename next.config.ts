import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent Orbis/ folder has its own lockfile; pin the workspace root to this project.
  turbopack: { root: __dirname },
  // Hide the Next.js dev-tools badge (bottom-left) during `next dev`; it never appears in production.
  devIndicators: false,
  // Build to plain HTML in out/ so nginx can serve it with no Node process. Pages are fixed at build
  // time: rebuild after publishing a blog post. trailingSlash writes /blog/x/index.html for nginx.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
