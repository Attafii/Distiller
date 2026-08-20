import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Refined Feed · Distiller",
  description: "Browse and filter AI-powered news summaries. Search by topic, region, and date range.",
  alternates: { canonical: `${siteUrl}/RefinedFeed` },
  openGraph: {
    url: `${siteUrl}/RefinedFeed`,
    title: "Refined Feed · Distiller",
    description: "Browse and filter AI-powered news summaries.",
    images: [{ url: `${siteUrl}/api/og?title=Refined+Feed`, width: 1200, height: 630, alt: "Refined Feed" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Refined Feed · Distiller",
    images: [`${siteUrl}/api/og?title=Refined+Feed`]
  }
};

export default function RefinedFeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}