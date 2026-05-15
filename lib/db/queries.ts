import "server-only";

import { db } from "@/lib/db";
import { subscriptions, bookmarks, readingHistory, alerts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type SubscriptionSelect = InferSelectModel<typeof subscriptions>;
export type SubscriptionInsert = InferInsertModel<typeof subscriptions>;
export type BookmarkSelect = InferSelectModel<typeof bookmarks>;
export type BookmarkInsert = InferInsertModel<typeof bookmarks>;
export type ReadingHistorySelect = InferSelectModel<typeof readingHistory>;
export type ReadingHistoryInsert = InferInsertModel<typeof readingHistory>;
export type AlertSelect = InferSelectModel<typeof alerts>;
export type AlertInsert = InferInsertModel<typeof alerts>;

export async function getUserSubscription(userId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId)
  });
}

export async function createSubscription(
  userId: string,
  stripeCustomerId: string,
  plan: "pro" | "team" | "free"
) {
  const [subscription] = await db.insert(subscriptions).values({
    userId,
    stripeCustomerId,
    plan,
    status: "active"
  }).returning();

  return subscription;
}

export async function updateSubscriptionStatus(
  subscriptionId: number,
  status: string
) {
  const [updated] = await db.update(subscriptions)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  return updated;
}

export async function getBookmarks(userId: string) {
  return db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.createdAt)]
  });
}

export async function addBookmark(
  userId: string,
  data: Omit<BookmarkInsert, "userId">
) {
  const [bookmark] = await db.insert(bookmarks).values({
    userId,
    ...data
  }).returning();

  return bookmark;
}

export async function removeBookmark(userId: string, articleId: string) {
  const [deleted] = await db.delete(bookmarks)
    .where(eq(bookmarks.articleId, articleId))
    .returning();

  return deleted;
}

export async function getReadingHistory(userId: string) {
  return db.query.readingHistory.findMany({
    where: eq(readingHistory.userId, userId),
    orderBy: [desc(readingHistory.readAt)],
    limit: 100
  });
}

export async function addReadingHistory(
  userId: string,
  data: Omit<ReadingHistoryInsert, "userId">
) {
  const [entry] = await db.insert(readingHistory).values({
    userId,
    ...data
  }).returning();

  return entry;
}

export async function getAlerts(userId: string) {
  return db.query.alerts.findMany({
    where: eq(alerts.userId, userId),
    orderBy: [desc(alerts.createdAt)]
  });
}

export async function createAlert(
  userId: string,
  data: Omit<AlertInsert, "userId">
) {
  const [alert] = await db.insert(alerts).values({
    userId,
    ...data
  }).returning();

  return alert;
}

export async function deleteAlert(userId: string, alertId: number) {
  const [deleted] = await db.delete(alerts)
    .where(eq(alerts.id, alertId))
    .returning();

  return deleted;
}