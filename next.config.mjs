import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve("."),
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
