import { NextResponse } from "next/server";

import { fetchNewsArticles } from "@/services/newsapi";
import { DistillService } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function escapeXml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFeedXml(params: {
  title: string;
  description: string;
  link: string;
  articles: Array<{
    title: string;
    description: string | null;
    url: string;
    imageUrl: string | null;
    publishedAt: string;
    sourceName: string;
    bullets: string[];
  }>;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";
  const lastBuildDate = new Date().toUTCString();

  const itemsXml = params.articles
    .map((article) => {
      const bulletsText = article.bullets.map((b) => `• ${b}`).join("\n");
      const description = article.description
        ? `${article.description}\n\n${bulletsText}`
        : bulletsText;

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(article.url)}</link>
      <guid isPermaLink="true">${escapeXml(article.url)}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <source>${escapeXml(article.sourceName)}</source>
      ${article.imageUrl ? `<enclosure url="${escapeXml(article.imageUrl)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(params.title)}</title>
    <description>${escapeXml(params.description)}</description>
    <link>${params.link}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  const rateLimit = await checkRateLimit(new Request("https://distiller.attafii.app/feed.xml"));
  if (!rateLimit.allowed) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";
  const siteTitle = "Distiller — AI News Intelligence";
  const siteDescription = "AI-powered news summaries with 3 concise bullets per article, grounded by RAG and embeddings. Powered by NVIDIA Build.";

  try {
    const distillService = DistillService.fromEnv();
    const { articles } = await fetchNewsArticles({
      category: "tech",
      page: 1,
      pageSize: 12
    });

    const distilledArticles = await Promise.all(
      articles.slice(0, 6).map(async (article) => {
        try {
          const summary = await distillService.summarizeArticle({
            article,
            mode: "auto",
            query: article.title
          });
          return {
            title: article.title,
            description: article.description,
            url: article.url,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            sourceName: article.source.name,
            bullets: summary.bullets
          };
        } catch {
          return {
            title: article.title,
            description: article.description,
            url: article.url,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            sourceName: article.source.name,
            bullets: [article.title, article.description ?? "", `Source: ${article.source.name}`]
          };
        }
      })
    );

    const rssContent = buildFeedXml({
      title: siteTitle,
      description: siteDescription,
      link: siteUrl,
      articles: distilledArticles
    });

    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-RateLimit-Remaining": String(rateLimit.remaining)
      }
    });
  } catch (error) {
    console.error("RSS feed generation failed", { error: error instanceof Error ? error.message : String(error) });
    return new NextResponse("Feed temporarily unavailable", { status: 502 });
  }
}