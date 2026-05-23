import "server-only";
import { getDb } from "@/lib/db";
import { userStreaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function recordReading(userId: string) {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const existing = await db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId)
  });

  if (!existing) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastReadDate: new Date(),
      weeklyReadCount: 1
    });
    return { currentStreak: 1, longestStreak: 1 };
  }

  const lastDate = existing.lastReadDate
    ? new Date(existing.lastReadDate).toISOString().split("T")[0]
    : null;

  if (lastDate === today) {
    return { currentStreak: existing.currentStreak, longestStreak: existing.longestStreak };
  }

  let newStreak = 1;
  if (lastDate === yesterday) {
    newStreak = existing.currentStreak + 1;
  }

  const newLongest = Math.max(existing.longestStreak, newStreak);

  await db.update(userStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastReadDate: new Date(),
      weeklyReadCount: (existing.weeklyReadCount ?? 0) + 1,
      updatedAt: new Date()
    })
    .where(eq(userStreaks.userId, userId));

  return { currentStreak: newStreak, longestStreak: newLongest };
}