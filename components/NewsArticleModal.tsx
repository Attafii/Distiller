"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, CalendarDays, ExternalLink, Globe, Loader2, MessageSquareMore, Send, Sparkles, User2, X } from "lucide-react";

import type { ArticleChatMessage, ArticleChatResponse, DistilledArticle } from "@/types/news";

import { Badge } from "@/components/ui/badge";
import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(publishedAt));
}

interface NewsArticleModalProps {
  article: DistilledArticle | null;
  open: boolean;
  onCloseAction: () => void;
}

export function NewsArticleModal({
  article,
  open,
  onCloseAction
}: NewsArticleModalProps) {
  const [messages, setMessages] = useState<ArticleChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open || !article) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        content: "Let me know if you have questions about this article — its framing, implications, or what it might be leaving out."
      }
    ]);
    setQuestion("");
    setError(null);
    setSending(false);

    firstFocusRef.current?.focus();
  }, [article, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onCloseAction]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  if (!open || !article) {
    return null;
  }

  const reducedMotion = useReducedMotion();

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
          content: "I couldn&apos;t answer that right now. Try a more specific question or revisit the article."
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
        transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onCloseAction}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 10 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.2, ease: "easeOut" }}
          className="flex h-[min(92vh,940px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 px-5 py-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="font-medium">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Article chat
                </Badge>
                <Badge variant="outline">{article.category}</Badge>
              </div>
              <h2 id="modal-title" tabIndex={-1} className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl line-clamp-2">
                {article.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{article.source.name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
              </div>
            </div>

            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onCloseAction}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="overflow-hidden border-border bg-card">
                {article.imageUrl ? (
                  <div className="aspect-video border-b border-border bg-muted">
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">Topic: {article.category}</Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <CalendarDays className="h-3 w-3" aria-hidden="true" />
                      {formatPublishedAt(article.publishedAt)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Article context</p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {article.description ?? "No description available. The full detail comes from the source content and AI summary."}
                    </p>
                    {article.content ? (
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">{article.content}</p>
                    ) : null}
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: "secondary", size: "sm" })}
                  >
                    Read original article
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="border-border bg-card">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI summary</p>
                      <Badge variant="outline" className="font-mono text-xs">
                        {shortModelName(article.summary.model)}
                      </Badge>
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

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                          AI insight
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{article.summary.insight}</p>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                          Conclusion
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{article.summary.conclusion}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{Math.round(article.summary.confidence * 100)}% confidence</Badge>
                      <Badge variant="outline">{article.summary.retrievedContext.length} snippets</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <MessageSquareMore className="h-4 w-4" aria-hidden="true" />
                      Chat about this article
                    </div>

                    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                      <div
                        className="max-h-64 space-y-3 overflow-y-auto pr-1"
                        role="log"
                        aria-label="Chat messages"
                        aria-live="polite"
                      >
                        {messages.map((message, index) => (
                          <div
                            key={`${message.role}-${index}`}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {message.role === "assistant" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" aria-hidden="true" />
                              </div>
                            ) : null}

                            <div
                              className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                                message.role === "user"
                                  ? "border-primary/20 bg-primary/10 text-foreground"
                                  : "border-border bg-card text-foreground"
                              }`}
                            >
                              {message.content}
                            </div>

                            {message.role === "user" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                                <User2 className="h-4 w-4" aria-hidden="true" />
                              </div>
                            ) : null}
                          </div>
                        ))}

                        {sending ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            <span>Analyzing article...</span>
                          </div>
                        ) : null}

                        <div ref={bottomRef} />
                      </div>

                      {error ? (
                        <p className="text-xs text-destructive" role="alert">
                          {error}
                        </p>
                      ) : null}

                      <form onSubmit={submitQuestion} className="space-y-3">
                        <label htmlFor="news-question" className="sr-only">
                          Ask a question about this news article
                        </label>
                        <textarea
                          id="news-question"
                          value={question}
                          onChange={(event) => setQuestion(event.target.value)}
                          placeholder="Ask about the framing, implications, or what it leaves out..."
                          rows={2}
                          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50"
                          disabled={sending}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              submitQuestion(e as unknown as FormEvent<HTMLFormElement>);
                            }
                          }}
                        />

                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
                          <Button
                            type="submit"
                            size="sm"
                            variant="default"
                            disabled={sending || !question.trim()}
                          >
                            <Send className="h-4 w-4" aria-hidden="true" />
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

function shortModelName(model: string) {
  return model === "fallback" ? "fallback" : model.split("/").pop() ?? model;
}