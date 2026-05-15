import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";

const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1
};

const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Distiller",
    template: "%s · Distiller"
  },
  description: "AI-powered news intelligence. Get concise 3-bullet summaries of top stories, grounded with RAG and embeddings. Stay informed in seconds.",
  keywords: [
    "AI news",
    "news summary",
    "RAG",
    "embeddings",
    "NVIDIA",
    "artificial intelligence",
    "news aggregator",
    "daily briefing",
    "executive summary",
    "AI research",
    "islamic finance",
    "african startups"
  ],
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
    <html lang="en" className={`${ibmPlexMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Distiller",
              url: siteUrl,
              description: "AI-powered news intelligence with RAG-grounded summaries.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/RefinedFeed?query={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              publisher: {
                "@type": "Organization",
                name: "Distiller",
                url: siteUrl,
                logo: {
                  "@type": "ImageObject",
                  url: `${siteUrl}/favicon.svg`
                }
              },
              sameAs: [
                "https://twitter.com/distiller",
                "https://github.com/Attafii/Distiller"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Distiller",
              url: siteUrl,
              description: "AI-powered news intelligence platform delivering concise 3-bullet summaries grounded with RAG and NVIDIA Build embeddings.",
              foundingDate: "2024",
              publisher: {
                "@type": "Organization",
                name: "Distiller",
                url: siteUrl
              },
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@distiller.attafii.app",
                contactType: "customer support"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToastProvider>
          <Analytics />
          <SpeedInsights />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}