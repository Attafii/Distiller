import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { desc } from "drizzle-orm";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Nav, type Headline, type NavUser } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ConsentAnalytics } from "@/components/ConsentAnalytics";
import { CookieBanner } from "@/components/cookie-banner";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { topicColor } from "@/lib/constants";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0a" }
  ],
  width: "device-width",
  initialScale: 1
};

const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Distiller — News Intelligence",
    template: "%s · Distiller"
  },
  description:
    "The world's news, three bullets. Verified briefings grounded in source evidence — ask questions and get sourced answers in seconds.",
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
    description: "The world's news, three bullets.",
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
    description: "The world's news, three bullets.",
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const navUser: NavUser = user ? { email: user.email, name: user.name, plan: user.plan } : null;

  let headlines: Headline[] = [];
  try {
    await ensureSeeded();
    const rows = await db
      .select({ id: articles.id, title: articles.title, topic: articles.topic })
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(14);
    headlines = rows.map((r) => ({
      topic: r.topic,
      title: r.title,
      href: "/RefinedFeed",
      color: topicColor(r.topic)
    }));
  } catch {
    headlines = [];
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${interTight.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
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
              description: "The world's news, three bullets.",
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
      </head>
      <body className="paper-grain relative flex min-h-screen flex-col bg-paper font-ui antialiased">
        <ThemeProvider defaultTheme="system" storageKey="distiller-theme">
          <ToastProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-surface"
            >
              Skip to main content
            </a>
            <div className="relative z-10 flex min-h-screen flex-col">
              <Nav user={navUser} headlines={headlines} />
              <main id="main" className="flex-1">
                {children}
              </main>
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
