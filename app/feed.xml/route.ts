import { NextResponse } from "next/server";
import { fetchNewsArticles } from "@/services/newsapi";
import { DistillService } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

function escapeXml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEmptyFeedXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Distiller — News Intelligence</title>
    <link>${siteUrl}</link>
    <description>Concise news briefings that cut through the noise.</description>
  </channel>
</rss>`;
}

export async function GET() {
  const rateLimit = await checkRateLimit(new Request("https://distiller.attafii.dev/feed.xml"));
  if (!rateLimit.allowed) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  async function generateFeed() {
    const distillService = DistillService.fromEnv();
    const { articles } = await fetchNewsArticles({
      category: "tech",
      page: 1,
      pageSize: 5
    });

    const distilledArticles = await Promise.all(
      articles.slice(0, 5).map(async (article) => {
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

    const itemsXml = distilledArticles
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
    </item>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Distiller — AI News Intelligence</title>
    <description>AI-powered news summaries with 3 concise bullets per article, grounded by RAG and embeddings.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${itemsXml}
  </channel>
</rss>`;
  }

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("RSS timeout exceeded (5s)")), 5000);
  });

  let rssContent: string;
  try {
    rssContent = await Promise.race([generateFeed(), timeout]);
  } catch (error) {
    console.error("RSS feed generation failed:", error instanceof Error ? error.message : String(error));
    rssContent = buildEmptyFeedXml();
  }

  return new NextResponse(rssContent, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600"
    }
  });
}