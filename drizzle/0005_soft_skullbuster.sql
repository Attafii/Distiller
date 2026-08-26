CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"source_url" text NOT NULL,
	"topic" text NOT NULL,
	"region" text NOT NULL,
	"excerpt" text NOT NULL,
	"bullets" jsonb NOT NULL,
	"deep_bullets" jsonb NOT NULL,
	"key_insight" text NOT NULL,
	"conclusion" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "breaking_news_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "weekly_summary_enabled" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "articles_topic_idx" ON "articles" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "articles_region_idx" ON "articles" USING btree ("region");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_id_account_id_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "alerts_user_id_idx" ON "alerts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_article_reactions_article_ip" ON "article_reactions" USING btree ("article_id","ip_hash");--> statement-breakpoint
CREATE INDEX "idx_article_reactions_article_id" ON "article_reactions" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_article_idx" ON "bookmarks" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE INDEX "reading_history_user_id_idx" ON "reading_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");