import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Enables static export
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Polyfill Node.js modules for Cloudflare Workers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        http: false,
        https: false,
        querystring: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }
    return config;
  },
  images: {
    unoptimized: true, // Disables Next.js image optimization (required for static export)
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during build
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
