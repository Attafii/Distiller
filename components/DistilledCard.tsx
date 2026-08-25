"use client";

import { memo, useState } from "react";

import { motion } from "framer-motion";
import { Bookmark, Copy, ExternalLink, Heart, Share2 } from "lucide-react";

import { getPriorityLabel } from "@/lib/article-signals";
import { TOPIC_OPTIONS } from "@/lib/news-options";
import { topicColor } from "@/lib/constants";
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
  const topicColorValue = topicColor(article.category);
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full"
    >
      <article className="lift flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
        {/* header */}
        <div className="border-b border-line px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center gap-2 t-mono">
            <span
              className="rounded-[4px] px-2 py-0.5"
              style={{
                background: `color-mix(in oklab, ${topicColorValue} 14%, transparent)`,
                color: topicColorValue
              }}
            >
              {topicLabel}
            </span>
            {article.priority !== "normal" ? (
              <span className="inline-flex items-center gap-1.5 text-rose">
                <span className="pulse h-1.5 w-1.5 rounded-full bg-rose" />
                {priorityLabel}
              </span>
            ) : null}
            <span className="ml-auto text-faint">{formatPublishedAt(article.publishedAt)}</span>
          </div>

          <h2 className="t-h3 mt-3 font-display font-semibold leading-snug text-ink">{article.title}</h2>

          <p className="t-mono mt-2.5 text-faint">
            {article.source.name}
            {article.likeCount > 0 ? <span> · {article.likeCount} likes</span> : null}
          </p>
        </div>

        {/* the three drops */}
        <div className="flex-1 px-5 py-4">
          <div className="t-micro flex items-center justify-between text-faint">
            <span>the brief</span>
            <span className="t-mono" title="RAG retrieval confidence">
              {Math.round(article.summary.confidence * 100)}% grounded
            </span>
          </div>

          <ul className="mt-3 space-y-2.5">
            {article.summary.bullets.map((bullet, index) => (
              <li key={`${article.id}-bullet-${index}`} className="flex gap-2.5">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45"
                  style={{
                    background: ["var(--ember)", "var(--amber)", "var(--teal)"][index % 3]
                  }}
                />
                <span className="text-[13.5px] leading-relaxed text-ink-2">{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-l-2 border-ember bg-ember-soft/40 px-3.5 py-2.5">
            <p className="t-micro flex items-center gap-1.5 text-ember">key insight</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
              {article.summary.insight}
            </p>
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <p className="t-micro text-faint">
              grounding · {article.summary.retrievedContext.length} snippets
            </p>
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
              {article.description ?? "The summary relies on retrieved source context."}
            </p>
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-1 border-t border-line px-3 py-2.5">
          <button
            type="button"
            aria-label="Like"
            title={article.likedByViewer ? "Liked" : "Like"}
            disabled={article.likedByViewer}
            onClick={() => onLikeAction?.(article)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-surface-2 ${
              article.likedByViewer ? "text-rose" : "text-muted hover:text-ink"
            } disabled:opacity-60`}
          >
            <Heart width={15} height={15} fill={article.likedByViewer ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            aria-label="Bookmark"
            title={article.bookmarked ? "Saved" : "Save"}
            onClick={() => onBookmarkAction?.(article)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-surface-2 ${
              article.bookmarked ? "text-ember" : "text-muted hover:text-ink"
            }`}
          >
            <Bookmark width={15} height={15} fill={article.bookmarked ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            aria-label="Copy summary"
            title={copied ? "Copied" : "Copy summary"}
            onClick={copySummary}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Copy width={15} height={15} />
          </button>

          <ShareButton
            title={article.title}
            briefSlug={article.id}
            bullets={article.summary.bullets}
            insight={article.summary.insight}
            sourceName={article.source.name}
            publishedAt={article.publishedAt}
            url={article.url}
          />

          <button
            type="button"
            onClick={() => onShareAction?.(article)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Share"
            title="Share"
          >
            <Share2 width={15} height={15} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAction?.(article)}
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink"
            >
              <span className="underline-draw">Read brief</span>
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-ember"
            >
              <span className="underline-draw">Source</span>
              <ExternalLink width={12} height={12} />
            </a>
          </div>
        </div>
      </article>
    </motion.article>
  );
});
