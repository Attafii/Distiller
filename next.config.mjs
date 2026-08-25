import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve("."),
  images: {
    // Native <img> used throughout (Path A) — no optimizer, no remote allowlist needed.
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  async redirects() {
    return [
      // Static-landing routes → the app's real pages
      { source: "/signup", destination: "/auth/signup", permanent: false },
      { source: "/signin", destination: "/auth/login", permanent: false },
      { source: "/feed", destination: "/RefinedFeed", permanent: false },
      { source: "/ask", destination: "/RefinedFeed", permanent: false },
      { source: "/bookmarks", destination: "/dashboard/bookmarks", permanent: false },
      { source: "/legal/privacy", destination: "/privacy", permanent: false },
      { source: "/legal/terms", destination: "/terms", permanent: false }
    ];
  }
};

export default nextConfig;