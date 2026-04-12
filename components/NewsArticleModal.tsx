"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CalendarDays, ExternalLink, Globe, Loader2, MessageSquareMore, Send, Sparkles, User2, X } from "lucide-react";

import type { ArticleChatMessage, ArticleChatResponse, DistilledArticle } from "@/types/news";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(publishedAt));
}

export function NewsArticleModal({
  article,
  open,
  onCloseAction
}: {
  article: DistilledArticle | null;
  open: boolean;
  onCloseAction: () => void;
}) {
  const [messages, setMessages] = useState<ArticleChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !article) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        content: "Let’s talk through this article. Ask about the framing, the implications, what it leaves out, or whether the story seems convincing."
      }
    ]);
    setQuestion("");
    setError(null);
    setSending(false);
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-3 py-4 backdrop-blur-sm sm:px-4"
        onClick={onCloseAction}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex h-[min(92vh,940px)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900/40 px-5 py-4 sm:px-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Article chat
                </Badge>
                <Badge variant="outline">{article.category}</Badge>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">{article.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                <span>{article.source.name}</span>
                <span aria-hidden="true">·</span>
                <span>{formatPublishedAt(article.publishedAt)}</span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onCloseAction} className="shrink-0 text-zinc-300 hover:text-zinc-100">
              <X className="h-4 w-4" />
              Close
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
                {article.imageUrl ? (
                  <div className="aspect-[16/9] border-b border-zinc-800 bg-zinc-950">
                    <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
                  </div>
                ) : null}

                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                    <Badge variant="outline">Topic: {article.category}</Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      {formatPublishedAt(article.publishedAt)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Article context</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {article.description ?? "This article does not include a description, so the full detail comes from the source content and the AI summary."}
                    </p>
                    {article.content ? (
                      <p className="text-sm leading-relaxed text-zinc-400">{article.content}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-900"
                    >
                      Read original
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">AI summary</p>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                        Model {article.summary.model === "fallback" ? "fallback" : article.summary.model.split("/").pop() ?? article.summary.model}
                      </Badge>
                    </div>

                    <ul className="space-y-3">
                      {article.summary.bullets.map((bullet) => (
                        <li key={bullet} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm leading-relaxed text-zinc-200">
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                          <Bot className="h-3.5 w-3.5" />
                          AI insight
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-300">{article.summary.insight}</p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                          <Globe className="h-3.5 w-3.5" />
                          Conclusion
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-300">{article.summary.conclusion}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <Badge variant="outline">{Math.round(article.summary.confidence * 100)}% confidence</Badge>
                      <Badge variant="outline">{article.summary.retrievedContext.length} snippets</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
                      <MessageSquareMore className="h-4 w-4" />
                      Chat with Distiller
                    </div>

                    <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                        {messages.map((message, index) => (
                          <div
                            key={`${message.role}-${index}`}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {message.role === "assistant" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200">
                                <Bot className="h-4 w-4" />
                              </div>
                            ) : null}

                            <div
                              className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                                message.role === "user"
                                  ? "border-zinc-700 bg-zinc-100 text-zinc-950"
                                  : "border-zinc-800 bg-zinc-900 text-zinc-200"
                              }`}
                            >
                              {message.content}
                            </div>

                            {message.role === "user" ? (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-100 text-zinc-950">
                                <User2 className="h-4 w-4" />
                              </div>
                            ) : null}
                          </div>
                        ))}

                        {sending ? (
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking through the article...
                          </div>
                        ) : null}

                        <div ref={bottomRef} />
                      </div>

                      {error ? <p className="text-xs text-zinc-500">{error}</p> : null}

                      <form onSubmit={submitQuestion} className="space-y-3">
                        <label htmlFor="news-question" className="sr-only">
                          Ask a question about this news
                        </label>
                        <textarea
                          id="news-question"
                          value={question}
                          onChange={(event) => setQuestion(event.target.value)}
                          placeholder="Ask for a take, critique the framing, or discuss what it means..."
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                        />

                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-zinc-500">Chat stays centered on the selected article.</p>
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
