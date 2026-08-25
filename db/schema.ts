import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const articles = pgTable(
  "articles",
  {
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
  },
  (t) => [
    index("articles_topic_idx").on(t.topic),
    index("articles_region_idx").on(t.region),
    index("articles_published_idx").on(t.publishedAt)
  ]
);

export type Article = typeof articles.$inferSelect;
