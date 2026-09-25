import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent Orbis/ folder has its own lockfile; pin the workspace root to this project.
  turbopack: { root: __dirname },
  // Hide the Next.js dev-tools badge (bottom-left) during `next dev`; it never appears in production.
  devIndicators: false,
};

export default nextConfig;
