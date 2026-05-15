import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.news";

  return {
    name: "Distiller",
    short_name: "Distiller",
    description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories.",
    start_url: siteUrl,
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: `${siteUrl}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
    categories: ["news", "productivity"],
    lang: "en",
    dir: "ltr"
  };
}