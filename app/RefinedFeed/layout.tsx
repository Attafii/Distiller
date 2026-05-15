import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refined Feed",
  description: "Browse and filter AI-powered news summaries. Search by topic, region, and date range to get concise 3-bullet briefings grounded with RAG and embeddings.",
  alternates: {
    canonical: "/RefinedFeed"
  },
  openGraph: {
    title: "Refined Feed · Distiller",
    description: "Browse and filter AI-powered news summaries. Get concise 3-bullet briefings grounded with RAG and embeddings.",
    images: [{ url: "/api/og?title=Refined+Feed&description=AI-powered+news+summaries+with+RAG+embeddings", width: 1200, height: 630, alt: "Refined Feed" }]
  }
};

export default function RefinedFeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}