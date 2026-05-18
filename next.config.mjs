import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve("."),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.newsapi.org" },
      { protocol: "https", hostname: "newsapi.org" },
      { protocol: "https", hostname: "**.bbc.co.uk" },
      { protocol: "https", hostname: "**.bbc.com" },
      { protocol: "https", hostname: "**.cnn.com" },
      { protocol: "https", hostname: "**.techcrunch.com" },
      { protocol: "https", hostname: "**.theverge.com" },
      { protocol: "https", hostname: "**.arstechnica.com" },
      { protocol: "https", hostname: "**.reuters.com" },
      { protocol: "https", hostname: "**.bloomberg.com" },
      { protocol: "https", hostname: "**.washingtonpost.com" },
      { protocol: "https", hostname: "**.nytimes.com" },
      { protocol: "https", hostname: "**.theguardian.com" },
      { protocol: "https", hostname: "**.apnews.com" },
      { protocol: "https", hostname: "**.axios.com" },
      { protocol: "https", hostname: "**.politico.com" },
      { protocol: "https", hostname: "**.ft.com" },
      { protocol: "https", hostname: "**.wsj.com" },
      { protocol: "https", hostname: "**.nature.com" },
      { protocol: "https", hostname: "**.science.org" },
      { protocol: "https", hostname: "**.thelancet.com" },
      { protocol: "https", hostname: "**.nejm.org" },
      { protocol: "https", hostname: "**.who.int" },
      { protocol: "https", hostname: "**.espn.com" },
      { protocol: "https", hostname: "**.espncricinfo.com" },
      { protocol: "https", hostname: "**.goal.com" },
      { protocol: "https", hostname: "**.variety.com" },
      { protocol: "https", hostname: "**.hollywoodreporter.com" },
      { protocol: "https", hostname: "**.deadline.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.imgur.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "cdn.**" },
      { protocol: "https", hostname: "static.**" },
      { protocol: "https", hostname: "media.**" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.gravatar.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.twimg.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.redditmedia.com" }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  }
};

export default nextConfig;