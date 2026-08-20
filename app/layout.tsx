import type { Metadata, Viewport } from "next";
import { Crimson_Pro, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConsentAnalytics } from "@/components/ConsentAnalytics";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-crimson-pro",
  display: "swap",
  style: ["normal"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

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
    <html lang="en" suppressHydrationWarning className={`${crimsonPro.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('distiller-theme');
                  var resolved = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
                  document.documentElement.classList.add(resolved);
                } catch(e) {}
              })();
            `
          }}
        />
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
                email: "hello@distiller.attafii.dev",
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
              <Nav />

              <main className="flex-1">{children}</main>

              <Footer />
            </div>
            <ConsentAnalytics />
            <CookieBanner />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}