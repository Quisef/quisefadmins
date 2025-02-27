import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Enables static export
  images: {
    unoptimized: true, // Disables Next.js image optimization (required for static export)
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during build
  },
};

export default nextConfig;
