import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono"
});

const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ],
  width: "device-width",
  initialScale: 1
};

const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.news"),
  title: {
    default: "Distiller",
    template: "%s · Distiller"
  },
  description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories, grounded with RAG and embeddings. Stay informed in seconds.",
  keywords: ["AI news", "news summary", "RAG", "embeddings", "NVIDIA", "artificial intelligence", "news aggregator", "daily briefing", "executive summary"],
  authors: [{ name: "Distiller" }],
  creator: "Distiller",
  publisher: "Distiller",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml"
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Distiller",
    title: "Distiller — AI News Intelligence",
    description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories, grounded with RAG and embeddings.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Distiller — AI News Intelligence"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Distiller — AI News Intelligence",
    description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories, grounded with RAG and embeddings.",
    images: ["/api/og"],
    creator: "@distiller"
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: "/favicon.svg"
  },
  category: "news",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_SITE_VERIFICATION
  }
};

export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}})()`
          }}
        />
        <ToastProvider>
          <Analytics />
          <SpeedInsights />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
