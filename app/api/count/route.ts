import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { REGIONS, TOPICS } from "@/lib/constants";
import { and, count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const topic = url.searchParams.get("topic");
  const region = url.searchParams.get("region");

  const conditions = [];
  if (topic && (TOPICS as readonly string[]).includes(topic)) {
    conditions.push(eq(articles.topic, topic));
  }
  if (region && (REGIONS as readonly string[]).includes(region)) {
    conditions.push(eq(articles.region, region));
  }

  try {
    const [row] = await db
      .select({ n: count() })
      .from(articles)
      .where(conditions.length ? and(...conditions) : undefined);
    return NextResponse.json({ count: row?.n ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
