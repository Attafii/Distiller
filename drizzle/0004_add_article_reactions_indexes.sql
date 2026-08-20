CREATE UNIQUE INDEX IF NOT EXISTS "idx_article_reactions_article_ip" ON "article_reactions" ("article_id", "ip_hash");
CREATE INDEX IF NOT EXISTS "idx_article_reactions_article_id" ON "article_reactions" ("article_id");
