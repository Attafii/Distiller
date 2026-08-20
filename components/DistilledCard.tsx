"use client";

import { memo, useState } from "react";

import { motion } from "framer-motion";
import { Bookmark, Copy, ExternalLink, Heart, Layers3, Share2, Sparkles } from "lucide-react";

import { COPY } from "@/lib/copy";
import { getPriorityLabel } from "@/lib/article-signals";
import { buttonStyles, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TOPIC_OPTIONS } from "@/lib/news-options";
import { ShareButton } from "@/components/ShareButton";
import type { DistilledArticle } from "@/types/news";

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Tunis"
  }).format(new Date(publishedAt));
}

export const DistilledCard = memo(function DistilledCard({
  article,
  onOpenAction,
  onLikeAction,
  onShareAction,
  onBookmarkAction
}: {
  article: DistilledArticle & { bookmarked?: boolean };
  onOpenAction?: (article: DistilledArticle) => void;
  onLikeAction?: (article: DistilledArticle) => void | Promise<void>;
  onShareAction?: (article: DistilledArticle) => void | Promise<void>;
  onBookmarkAction?: (article: DistilledArticle) => void | Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const topicLabel = TOPIC_OPTIONS.find((option) => option.id === article.category)?.label ?? article.category;
  const priorityLabel = getPriorityLabel(article.priority);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(article.summary.bullets.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="h-full group"
    >
      <Card className="flex h-full flex-col overflow-hidden border-white/[0.06] bg-[#0a0a0f]/80 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/20 hover:shadow-primary/5 gradient-border relative">
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
        
        <CardHeader className="space-y-4 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-lg">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI Summary
              </Badge>
              <Badge variant="outline" className="transition-colors duration-300">{topicLabel}</Badge>
              {article.priority !== "normal" ? (
                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400 animate-pulse">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                  {priorityLabel}
                </Badge>
              ) : null}
            </div>

            {article.likeCount > 0 ? (
              <Badge variant="outline" className="border-border text-muted-foreground">
                {article.likeCount} likes
              </Badge>
            ) : null}
            <ShareButton
              title={article.title}
              briefSlug={article.id}
              bullets={article.summary.bullets}
              insight={article.summary.insight}
              sourceName={article.source.name}
              publishedAt={article.publishedAt}
              url={article.url}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
              {article.title}
            </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <span>{article.source.name}</span>
              <span aria-hidden="true">·</span>
              <span>{formatPublishedAt(article.publishedAt)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-5 p-6">
          <section className="space-y-3" aria-label="AI summary">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <span>Distilled insights</span>
              <span className="font-mono text-[11px] text-muted-foreground" title={COPY.scoreTooltip}>
                {Math.round(article.summary.confidence * 100)}% RAG retrieval confidence
              </span>
            </div>

            <ul className="space-y-3">
              {article.summary.bullets.map((bullet, index) => (
                  <li
                  key={`${article.id}-bullet-${index}`}
                  className="rounded-2xl border border-border bg-card/75 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-3 rounded-2xl border border-border bg-card/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              <span>RAG grounding</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {article.description ?? "The article did not include a description, so the summary relies on retrieved source context."}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{article.summary.retrievedContext.length} snippets</Badge>
            </div>
          </section>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t border-border p-6 pt-5">
          <Button
            variant="outline"
            size="sm"
            className={article.likedByViewer ? "border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/10" : "border-border text-foreground hover:bg-card"}
            onClick={() => onLikeAction?.(article)}
            disabled={article.likedByViewer}
          >
            <Heart className="h-4 w-4" fill={article.likedByViewer ? "currentColor" : "none"} />
            {article.likedByViewer ? "Liked" : "Like"}
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onShareAction?.(article)}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`hover:text-foreground ${article.bookmarked ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => onBookmarkAction?.(article)}
          >
            <Bookmark className="h-4 w-4" fill={article.bookmarked ? "currentColor" : "none"} />
            {article.bookmarked ? "Saved" : "Save"}
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={copySummary}>
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy summary"}
          </Button>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-card" onClick={() => onOpenAction?.(article)}>
            See more
          </Button>

          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({ variant: "secondary", size: "sm", className: "ml-auto" })}
          >
            Read original
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardFooter>
      </Card>
    </motion.article>
  );
});
