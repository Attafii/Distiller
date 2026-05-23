import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refined Feed · Distiller",
  description: "Browse and filter AI-powered news summaries. Search by topic, region, and date range.",
  alternates: { canonical: "https://distiller.attafii.dev/RefinedFeed" },
  openGraph: {
    url: "https://distiller.attafii.dev/RefinedFeed",
    title: "Refined Feed · Distiller",
    description: "Browse and filter AI-powered news summaries.",
    images: [{ url: "https://distiller.attafii.dev/api/og?title=Refined+Feed", width: 1200, height: 630, alt: "Refined Feed" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Refined Feed · Distiller",
    images: ["https://distiller.attafii.dev/api/og?title=Refined+Feed"]
  }
};

export default function RefinedFeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}