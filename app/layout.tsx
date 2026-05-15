import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" }
  ],
  width: "device-width",
  initialScale: 1
};

const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Distiller",
    template: "%s · Distiller"
  },
  description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
  keywords: [
    "news",
    "news summary",
    "daily briefing",
    "executive summary",
    "world news",
    "ai news",
    "islamic finance",
    "african startups",
    "news aggregator"
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
    title: "Distiller — News Intelligence",
    description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Distiller — News Intelligence"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Distiller — News Intelligence",
    description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
    images: ["/api/og"]
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg"
  },
  category: "news"
};

export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Distiller",
              url: siteUrl,
              description: "Stay informed in seconds. Get concise news briefings.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/RefinedFeed?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              publisher: {
                "@type": "Organization",
                name: "Distiller",
                url: siteUrl,
                logo: { "@type": "ImageObject", url: `${siteUrl}/favicon.svg` }
              }
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
              description: "Stay informed in seconds. Get concise news briefings that cut through the noise.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@distiller.attafii.app",
                contactType: "customer support"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider defaultTheme="system" storageKey="distiller-theme">
          <ToastProvider>
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                  <a href="/" className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M4 6h16M4 12h12M4 18h8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold tracking-tight">Distiller</p>
                      <p className="text-xs text-muted-foreground">News Intelligence</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4">
                    <a
                      href="/RefinedFeed"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Browse
                    </a>
                    <a
                      href="/pricing"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Pricing
                    </a>
                    <ModeToggle />
                    <a
                      href="/auth/login"
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
                    >
                      Sign in
                    </a>
                    <a
                      href="/auth/signup"
                      className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Get started
                    </a>
                  </div>
                </nav>
              </header>

              <main className="flex-1">{children}</main>

              <footer className="border-t border-border/60 bg-background">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
                  <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Distiller.
                  </p>
                  <div className="flex items-center gap-4">
                    <a href="/RefinedFeed" className="text-xs text-muted-foreground hover:text-foreground">Feed</a>
                    <a href="/pricing" className="text-xs text-muted-foreground hover:text-foreground">Pricing</a>
                    <a href="/feed.xml" className="text-xs text-muted-foreground hover:text-foreground">RSS</a>
                    <a href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground">Sign in</a>
                  </div>
                </div>
              </footer>
            </div>
            <Analytics />
            <SpeedInsights />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}