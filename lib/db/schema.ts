import { pgTable, text, timestamp, boolean, integer, serial, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  topic: text("topic").notNull(),
  region: text("region").notNull(),
  excerpt: text("excerpt").notNull(),
  bullets: jsonb("bullets").$type<string[]>().notNull(),
  deepBullets: jsonb("deep_bullets").$type<string[]>().notNull(),
  keyInsight: text("key_insight").notNull(),
  conclusion: text("conclusion").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  topicIdx: index("articles_topic_idx").on(t.topic),
  regionIdx: index("articles_region_idx").on(t.region),
  publishedIdx: index("articles_published_idx").on(t.publishedAt)
}));

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => ({
  providerAccountUnique: uniqueIndex("accounts_provider_id_account_id_unique").on(
    table.providerId,
    table.accountId
  )
}));

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId)
}));

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  articleId: text("article_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  source: text("source"),
  category: text("category"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  userIdIdx: index("bookmarks_user_id_idx").on(table.userId),
  userIdArticleIdIdx: index("bookmarks_user_article_idx").on(table.userId, table.articleId)
}));

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  frequency: text("frequency").notNull().default("daily"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => ({
  userIdIdx: index("alerts_user_id_idx").on(table.userId)
}));

export const readingHistory = pgTable("reading_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  articleId: text("article_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  category: text("category"),
  readAt: timestamp("read_at").notNull().defaultNow()
}, (table) => ({
  userIdIdx: index("reading_history_user_id_idx").on(table.userId)
}));

export const articleReactions = pgTable(
  "article_reactions",
  {
    id: serial("id").primaryKey(),
    articleId: text("article_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
  },
  (table) => ({
    articleIdIdx: uniqueIndex("idx_article_reactions_article_ip").on(table.articleId, table.ipHash),
    articleIdOnlyIdx: index("idx_article_reactions_article_id").on(table.articleId)
  })
);

export const userArticleUsage = pgTable(
  "user_article_usage",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    yearMonth: text("year_month").notNull(),
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
  },
  (table) => ({
    userMonthIndex: uniqueIndex("idx_user_article_usage_user_month").on(
      table.userId,
      table.yearMonth
    )
  })
);

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  topics: text("topics").array().default([]),
  regions: text("regions").array().default([]),
  deliveryPreference: text("delivery_preference").default("web"),
  dailyEmailEnabled: boolean("daily_email_enabled").default(false),
  dailyEmailTime: text("daily_email_time").default("07:00"),
  breakingNewsEnabled: boolean("breaking_news_enabled").default(false),
  weeklySummaryEnabled: boolean("weekly_summary_enabled").default(false),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastReadDate: timestamp("last_read_date"),
  weeklyReadCount: integer("weekly_read_count").default(0),
  topTopic: text("top_topic"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type ReadingHistory = typeof readingHistory.$inferSelect;
export type UserArticleUsage = typeof userArticleUsage.$inferSelect;