import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { userPreferences, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DistillService } from "@/lib/ai";
import { fetchWithFallback } from "@/services/news-providers";
import { sendEmail, buildDailyBriefingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[DailyBriefing] Starting daily briefing cron");

  const db = getDb();

  // Find users with daily email enabled
  const subscribedUsers = await db
    .select({
      userId: userPreferences.userId,
      email: users.email,
      topics: userPreferences.topics,
      regions: userPreferences.regions
    })
    .from(userPreferences)
    .innerJoin(users, eq(userPreferences.userId, users.id))
    .where(eq(userPreferences.dailyEmailEnabled, true));

  if (subscribedUsers.length === 0) {
    console.log("[DailyBriefing] No users with daily email enabled");
    return NextResponse.json({ sent: 0, failed: 0, note: "No subscribers" });
  }

  console.log(`[DailyBriefing] Found ${subscribedUsers.length} subscribers`);

  // Fetch top articles (global tech news as default)
  let articles;
  try {
    const result = await fetchWithFallback({
      category: "tech",
      country: "global",
      dateRange: "24h",
      page: 1,
      pageSize: 6
    });
    articles = result.articles;
  } catch (error) {
    console.error("[DailyBriefing] Failed to fetch articles:", error);
    return NextResponse.json({ sent: 0, failed: 0, error: "Failed to fetch articles" }, { status: 500 });
  }

  if (articles.length === 0) {
    console.log("[DailyBriefing] No articles found");
    return NextResponse.json({ sent: 0, failed: 0, note: "No articles" });
  }

  // Generate AI summaries
  const distillService = DistillService.fromEnv();
  const summarizedArticles = [];

  for (const article of articles.slice(0, 5)) {
    try {
      const summary = await distillService.summarizeArticle({
        article,
        mode: "fast"
      });
      summarizedArticles.push({
        title: article.title,
        bullets: summary.bullets,
        url: article.url,
        source: article.source.name
      });
    } catch (error) {
      console.warn(`[DailyBriefing] Failed to summarize "${article.title}":`, error);
      summarizedArticles.push({
        title: article.title,
        bullets: [
          article.description ?? article.title,
          `Source: ${article.source.name}`,
          "Read the full article for more details."
        ],
        url: article.url,
        source: article.source.name
      });
    }
  }

  // Send emails
  let sent = 0;
  let failed = 0;

  for (const user of subscribedUsers) {
    try {
      const email = buildDailyBriefingEmail(summarizedArticles);
      await sendEmail({ to: user.email, subject: email.subject, html: email.html });
      sent++;
      console.log(`[DailyBriefing] Sent to ${user.email}`);
    } catch (error) {
      failed++;
      console.error(`[DailyBriefing] Failed to send to ${user.email}:`, error);
    }
  }

  console.log(`[DailyBriefing] Complete: ${sent} sent, ${failed} failed`);

  return NextResponse.json({
    sent,
    failed,
    totalSubscribers: subscribedUsers.length,
    articlesSummarized: summarizedArticles.length
  });
}
