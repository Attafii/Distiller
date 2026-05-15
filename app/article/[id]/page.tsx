import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TOPIC_OPTIONS } from "@/lib/news-options";

interface ArticlePageProps {
  searchParams: Promise<{
    id?: string;
    title?: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    publishedAt?: string;
    sourceName?: string;
    sourceId?: string;
    category?: string;
    bullets?: string;
    insight?: string;
    conclusion?: string;
    model?: string;
    confidence?: string;
  }>;
}

function buildDescription(description: string | null | undefined, fallback: string): string {
  if (description?.trim()) {
    return description.trim();
  }
  return fallback;
}

function parseBullets(bulletsStr: string | undefined): string[] {
  if (!bulletsStr) {
    return [];
  }
  try {
    return JSON.parse(decodeURIComponent(bulletsStr)) as string[];
  } catch {
    return [];
  }
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export async function generateMetadata({ searchParams }: ArticlePageProps): Promise<Metadata> {
  const params = await searchParams;
  const title = params.title ? decodeURIComponent(params.title) : null;
  const description = buildDescription(params.description, "AI-powered news summary from Distiller — 3 concise bullets, grounded in source text.");
  const imageUrl = params.imageUrl ? decodeURIComponent(params.imageUrl) : undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";

  const ogTitle = title ? `${title} · Distiller` : "Article · Distiller";
  const ogDescription = truncate(description, 200);

  return {
    title: title ?? "Article",
    description: ogDescription,
    alternates: {
      canonical: params.id ? `/article/${params.id}` : "/article"
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "article",
      publishedTime: params.publishedAt,
      authors: params.sourceName ? [params.sourceName] : undefined,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title ?? "Article image" }]
        : [{ url: `/api/og?title=${encodeURIComponent(title ?? "Distiller Article")}&description=${encodeURIComponent(ogDescription)}`, width: 1200, height: 630, alt: "Article preview" }]
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: imageUrl ?? [`/api/og?title=${encodeURIComponent(title ?? "Distiller")}&description=${encodeURIComponent(ogDescription)}`]
    }
  };
}

export default async function ArticlePage({ searchParams }: ArticlePageProps) {
  const params = await searchParams;

  if (!params.title || !params.id) {
    notFound();
  }

  const title = decodeURIComponent(params.title);
  const description = buildDescription(params.description, "No description available for this article.");
  const url = params.url ? decodeURIComponent(params.url) : null;
  const imageUrl = params.imageUrl ? decodeURIComponent(params.imageUrl) : null;
  const publishedAt = params.publishedAt ?? new Date().toISOString();
  const sourceName = params.sourceName ?? "Unknown source";
  const sourceId = params.sourceId ?? null;
  const category = (params.category ?? "world") as string;
  const bullets = parseBullets(params.bullets);
  const insight = params.insight ? decodeURIComponent(params.insight) : null;
  const conclusion = params.conclusion ? decodeURIComponent(params.conclusion) : null;
  const model = params.model ?? "unknown";
  const confidence = params.confidence ? parseFloat(params.confidence) : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";
  const topicLabel = TOPIC_OPTIONS.find((o) => o.id === category)?.label ?? category;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: description,
    url: url ?? siteUrl,
    image: imageUrl ?? undefined,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: {
      "@type": "Person",
      name: sourceName,
      url: url ?? undefined
    },
    publisher: {
      "@type": "Organization",
      name: "Distiller",
      url: siteUrl
    },
    articleSection: topicLabel,
    keywords: [category, "news", "AI summary", "Distiller"].join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url ?? `${siteUrl}/article/${params.id}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Refined Feed",
        item: `${siteUrl}/RefinedFeed`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: truncate(title, 40),
        item: `${siteUrl}/article/${params.id}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <a href="/RefinedFeed" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">Article summary</p>
            </div>
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" id="main-content">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/RefinedFeed" className="hover:text-foreground transition-colors">Refined Feed</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">{truncate(title, 40)}</li>
          </ol>
        </nav>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="default" className="font-medium">
                <Newspaper className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                AI Summary
              </Badge>
              <Badge variant="outline">{topicLabel}</Badge>
              {model && model !== "fallback" ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {model.split("/").pop()}
                </Badge>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-4 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{sourceName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={publishedAt}>
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "long",
                  timeStyle: "short"
                }).format(new Date(publishedAt))}
              </time>
              {confidence > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{Math.round(confidence * 100)}% confidence</span>
                </>
              ) : null}
            </div>
          </header>

          {imageUrl ? (
            <div className="mb-8 rounded-2xl border border-border overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={title}
                className="w-full max-h-[500px] object-cover"
                loading="eager"
              />
            </div>
          ) : null}

          {description ? (
            <Card className="mb-8 border-border bg-card">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed text-foreground">{description}</p>
              </CardContent>
            </Card>
          ) : null}

          {bullets.length > 0 ? (
            <Card className="mb-8 border-border bg-card">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Summary — 3 Key Points</p>
                <ul className="space-y-4" role="list">
                  {bullets.map((bullet, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-base leading-relaxed text-foreground"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            {insight ? (
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
                    AI Insight
                  </div>
                  <p className="text-base leading-relaxed text-foreground">{insight}</p>
                </CardContent>
              </Card>
            ) : null}

            {conclusion ? (
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    <span className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                    Conclusion
                  </div>
                  <p className="text-base leading-relaxed text-foreground">{conclusion}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {url ? (
            <div className="flex flex-wrap gap-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-card hover:bg-muted/50 transition-colors"
              >
                Read original article
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="/RefinedFeed"
                className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary/90 transition-colors"
              >
                Explore more articles
              </a>
            </div>
          ) : null}
        </article>
      </div>
    </main>
  );
}