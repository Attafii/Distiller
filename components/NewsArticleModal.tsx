"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, CalendarDays, ExternalLink, Globe, Heart, Loader2, MessageSquareMore, Send, Share2, Sparkles, User2, X } from "lucide-react";

import { COPY } from "@/lib/copy";
import { getPriorityLabel } from "@/lib/article-signals";
import type { ArticleChatMessage, ArticleChatResponse, DistilledArticle } from "@/types/news";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Tunis"
  }).format(new Date(publishedAt));
}

export function NewsArticleModal({
  article,
  open,
  onCloseAction,
  onLikeAction,
  onShareAction
}: {
  article: DistilledArticle | null;
  open: boolean;
  onCloseAction: () => void;
  onLikeAction?: (article: DistilledArticle) => void | Promise<void>;
  onShareAction?: (article: DistilledArticle) => void | Promise<void>;
}) {
  const [messages, setMessages] = useState<ArticleChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !article) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        content: "I'm ready to discuss this story. I can analyze the framing, debate the implications, list pros and cons, search for related coverage, or discuss what the article leaves out. What would you like to explore?"
      }
    ]);
    setQuestion("");
    setError(null);
    setSending(false);

    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [article, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // ponytail: use data attribute to track modal count for nested modals
    const count = Number(document.body.dataset.modalCount ?? "0") + 1;
    document.body.dataset.modalCount = String(count);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      const newCount = Number(document.body.dataset.modalCount ?? "1") - 1;
      document.body.dataset.modalCount = String(Math.max(0, newCount));
      if (newCount <= 0) {
        document.body.style.overflow = previousOverflow;
        delete document.body.dataset.modalCount;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCloseAction, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  if (!open || !article) {
    return null;
  }

  const currentArticle = article;
  const priorityLabel = getPriorityLabel(currentArticle.priority);
  const quickPrompts = [
    "What are the pros and cons of this development?",
    "Debate the strongest argument against this story's framing.",
    "Search for related coverage and compare perspectives.",
    "What is the likely short-term and long-term impact?"
  ];

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || sending) {
      return;
    }

    const nextMessages: ArticleChatMessage[] = [...messages, { role: "user", content: trimmedQuestion }];
    setMessages(nextMessages);
    setQuestion("");
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/news/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          article,
          question: trimmedQuestion,
          history: nextMessages
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to get an answer");
      }

      const payload = (await response.json()) as ArticleChatResponse;
      setMessages((current) => [...current, { role: "assistant", content: payload.answer }]);
    } catch (submitError) {
      const fallbackMessage = submitError instanceof Error ? submitError.message : "Unknown chat error";
      setError(fallbackMessage);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not answer that just now. Try a narrower question or revisit the article context."
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-3 py-4 backdrop-blur-sm sm:px-4"
        onClick={onCloseAction}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex h-[min(92vh,940px)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-border bg-background shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-border bg-card/60 px-5 py-4 sm:px-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Article chat
                </Badge>
                <Badge variant="outline">{article.category}</Badge>
                {article.priority !== "normal" ? (
                  <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-100">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.75)]" />
                    {priorityLabel}
                  </Badge>
                ) : null}
                {article.likeCount > 0 ? (
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {article.likeCount} likes
                  </Badge>
                ) : null}
              </div>
              <h2 id="modal-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{article.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <span>{article.source.name}</span>
                <span aria-hidden="true">·</span>
                <span>{formatPublishedAt(article.publishedAt)}</span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onCloseAction} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
              Close
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="overflow-hidden border-border bg-card/85">
                {article.imageUrl ? (
                  <div className="aspect-[16/9] border-b border-border bg-card">
                    <Image src={article.imageUrl} alt={article.title} width={800} height={450} className="h-full w-full object-cover" />
                  </div>
                ) : null}

                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    <Badge variant="outline">Topic: {article.category}</Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      {formatPublishedAt(article.publishedAt)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Article context</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {article.description ?? "This article does not include a description."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
                      >
                        Read original
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      {onShareAction ? (
                        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onShareAction(article)}>
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={
                          article.likedByViewer
                            ? "border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/10"
                            : "border-border text-foreground hover:bg-secondary"
                        }
                        onClick={() => onLikeAction?.(article)}
                        disabled={article.likedByViewer}
                      >
                        <Heart className="h-4 w-4" fill={article.likedByViewer ? "currentColor" : "none"} />
                        {article.likedByViewer ? "Liked" : "Like"}
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="border-border bg-card/85">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">AI summary</p>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {Math.round(article.summary.confidence * 100)}% confidence
                      </Badge>
                    </div>

                    <ul className="space-y-3">
                      {article.summary.bullets.map((bullet, index) => (
                        <li
                          key={`${article.id}-bullet-${index}`}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" />
                          AI insight
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{article.summary.insight}</p>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          Conclusion
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{article.summary.conclusion}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" title={COPY.scoreTooltip}>{Math.round(article.summary.confidence * 100)}% RAG retrieval confidence</Badge>
                      <Badge variant="outline">{article.summary.retrievedContext.length} snippets</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/85">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      <MessageSquareMore className="h-4 w-4" />
                      Chat with Distiller
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border bg-card/70 p-4">
                      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                        {messages.map((message, index) => (
                          <div
                            key={`${message.role}-${index}`}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {message.role === "assistant" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
                                <Bot className="h-4 w-4" />
                              </div>
                            ) : null}

                            <div
                              className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                                message.role === "user"
                                  ? "border-primary/25 bg-primary/12 text-foreground"
                                  : "border-border bg-card text-foreground"
                              }`}
                            >
                              {message.content}
                            </div>

                            {message.role === "user" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-foreground">
                                <User2 className="h-4 w-4" />
                              </div>
                            ) : null}
                          </div>
                        ))}

                        {sending ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking through the article...
                          </div>
                        ) : null}

                        <div ref={bottomRef} />
                      </div>

                      {error ? <p className="text-xs text-muted-foreground">{error}</p> : null}

                      <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => setQuestion(prompt)}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/45 hover:bg-secondary hover:text-foreground"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={submitQuestion} className="space-y-3">
                        <label htmlFor="news-question" className="sr-only">
                          Ask a question about this news
                        </label>
                        <textarea
                          id="news-question"
                          value={question}
                          onChange={(event) => setQuestion(event.target.value)}
                          placeholder="Debate, ask for pros and cons, or search for related coverage..."
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                        />

                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Distiller can search the web for additional context.</p>
                          <Button type="submit" size="sm" variant="default" disabled={sending || !question.trim()}>
                            <Send className="h-4 w-4" />
                            Send
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
