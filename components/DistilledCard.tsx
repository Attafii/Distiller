"use client";

import { memo, useRef, useState } from "react";

import { Copy, ExternalLink, Layers3, Share2, Sparkles } from "lucide-react";

import { buttonStyles, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TOPIC_OPTIONS } from "@/lib/news-options";
import { useToast } from "@/components/ToastProvider";
import type { DistilledArticle } from "@/types/news";

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(publishedAt));
}

function shortModelName(model: string) {
  return model === "fallback" ? "fallback" : model.split("/").pop() ?? model;
}

interface DistilledCardProps {
  article: DistilledArticle;
  onOpenAction?: (article: DistilledArticle) => void;
  priority?: boolean;
}

export const DistilledCard = memo(function DistilledCard({
  article,
  onOpenAction,
  priority = false
}: DistilledCardProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicLabel = TOPIC_OPTIONS.find((option) => option.id === article.category)?.label ?? article.category;
  const { addToast } = useToast();

  const clearCopyTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(article.summary.bullets.join("\n"));
      setCopied(true);
      clearCopyTimeout();
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 1500);
    } catch {
      addToast("Failed to copy to clipboard", "error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary.bullets.join(" • "),
          url: article.url
        });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${article.title}\n\n${article.summary.bullets.join("\n")}\n\nRead more: ${article.url}`);
        addToast("Link copied to clipboard", "success");
      } catch {
        addToast("Failed to copy link", "error");
      }
    }
  };

  const handleOpenDetails = () => {
    onOpenAction?.(article);
  };

  return (
    <Card
      className="group flex flex-col overflow-hidden border-border bg-card shadow-card transition-shadow hover:shadow-elevated"
    >
      <CardHeader className="space-y-4 border-b border-border bg-muted/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="default" className="font-medium">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            AI Summary
          </Badge>
          <Badge variant="outline" className="text-xs">{topicLabel}</Badge>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl line-clamp-2">
            {article.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <section aria-label="AI summary" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">Key insights</span>
            <span className="font-mono text-[10px] tabular-nums">
              {Math.round(article.summary.confidence * 100)}% confidence
            </span>
          </div>

          <ul className="space-y-3" role="list">
            {article.summary.bullets.map((bullet, index) => (
              <li
                key={index}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Context</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {article.description ?? "No description available. The summary is based on retrieved source context."}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-xs font-mono">
              {shortModelName(article.summary.model)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {article.summary.retrievedContext.length} snippets
            </Badge>
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border p-5 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={copySummary}
          className="text-muted-foreground hover:text-foreground"
          aria-label={copied ? "Summary copied to clipboard" : "Copy summary to clipboard"}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Share article"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDetails}
          className="border-border text-foreground hover:bg-muted/50"
        >
          Details
        </Button>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "default", size: "sm", className: "ml-auto" })}
          aria-label={`Read original article from ${article.source.name}`}
        >
          Read original
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </CardFooter>
    </Card>
  );
});