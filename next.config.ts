import type { NextConfig } from "next";

/** Set in CI for GitHub Pages project sites, e.g. /SmartDrop */
const raw = process.env.BASE_PATH?.trim() ?? "";
const basePath = raw.startsWith("/") ? raw : raw ? `/${raw}` : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
