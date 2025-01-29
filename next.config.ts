import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Enables static export
  images: {
    unoptimized: true, // Disables Next.js image optimization (required for static export)
  },
};

export default nextConfig;
