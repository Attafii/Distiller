"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { Copy, ExternalLink, Layers3, Sparkles } from "lucide-react";

import { buttonStyles, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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

export function DistilledCard({
  article,
  onOpenAction
}: {
  article: DistilledArticle;
  onOpenAction?: (article: DistilledArticle) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copySummary = async () => {
    await navigator.clipboard.writeText(article.summary.bullets.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden border-zinc-800/90 bg-zinc-950/90 shadow-soft backdrop-blur">
        <CardHeader className="space-y-4 border-b border-zinc-800/80 bg-zinc-900/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Summary
            </Badge>
            <Badge variant="outline">{article.category}</Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-zinc-100 sm:text-xl">
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>{article.source.name}</span>
              <span aria-hidden="true">·</span>
              <span>{formatPublishedAt(article.publishedAt)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-5 p-6">
          <section className="space-y-3" aria-label="AI summary">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>Distilled insights</span>
              <span className="font-mono text-[11px] text-zinc-400">
                {Math.round(article.summary.confidence * 100)}% confidence
              </span>
            </div>

            <ul className="space-y-3">
              {article.summary.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm leading-relaxed text-zinc-200"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <Layers3 className="h-3.5 w-3.5" />
              <span>Grounding</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {article.description ?? "The article did not include a description, so the summary relies on retrieved source context."}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <Badge variant="outline">Model {shortModelName(article.summary.model)}</Badge>
              <Badge variant="outline">{article.summary.retrievedContext.length} snippets</Badge>
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 border-t border-zinc-800 p-6 pt-5">
          <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100" onClick={copySummary}>
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy summary"}
          </Button>

          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-100 hover:bg-zinc-900" onClick={() => onOpenAction?.(article)}>
            Open details
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
}
