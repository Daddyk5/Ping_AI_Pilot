import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pingpilot.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
