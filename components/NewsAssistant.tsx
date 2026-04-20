"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, User2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRY_OPTIONS, DATE_RANGE_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";
import type { Category, CountryCode, DateRange, NewsAssistantResponse } from "@/types/news";

interface NewsAssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function formatPublishedAt(publishedAt: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(publishedAt));
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NewsAssistant({
  category,
  country,
  dateRange
}: {
  category: Category;
  country: CountryCode;
  dateRange: DateRange;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<NewsAssistantMessage[]>([]);
  const [latestSources, setLatestSources] = useState<NewsAssistantResponse["articles"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryLabel = TOPIC_OPTIONS.find((option) => option.id === category)?.label ?? category;
  const countryLabel = COUNTRY_OPTIONS.find((option) => option.id === country)?.label ?? country;
  const dateRangeLabel = DATE_RANGE_OPTIONS.find((option) => option.id === dateRange)?.label ?? dateRange;

  const starterPrompts = useMemo(
    () => [
      `What is the latest ${categoryLabel.toLowerCase()} story right now?`,
      country === "global"
        ? `Find the most important story in ${categoryLabel.toLowerCase()} and explain why it matters.`
        : `What is happening in ${countryLabel} news right now?`,
      `Give me the details, context, and sources for the strongest match.`
    ],
    [categoryLabel, country, countryLabel]
  );

  const conversationHistory = messages.map((message) => ({
    role: message.role,
    content: message.content
  }));

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage: NewsAssistantMessage = {
      id: makeId(),
      role: "user",
      content: trimmedQuestion
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/news/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          history: conversationHistory,
          category,
          country,
          dateRange
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as NewsAssistantResponse;
      setLatestSources(payload.articles);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: payload.answer
        }
      ]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unknown assistant error";
      setError(message);
      setLatestSources([]);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: "I could not search the latest coverage just now. Try narrowing the topic, company, person, or region."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-zinc-800/90 bg-zinc-900/60 shadow-soft">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  <Bot className="mr-1.5 h-3.5 w-3.5" />
                  News assistant
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Search + answer
                </Badge>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                  Ask for a specific story, fact, or update and get a detailed answer.
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                  The assistant parses your question, searches the current coverage, ranks the best matches, and answers
                  with the strongest source material it can find.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {categoryLabel}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {countryLabel}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {dateRangeLabel}
              </Badge>
            </div>
          </div>

          <form onSubmit={submitQuestion} className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label htmlFor="news-assistant-question" className="sr-only">
              Ask the news assistant
            </label>

            <textarea
              id="news-assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              placeholder="Ask for a specific story, person, company, or issue..."
              className="min-h-28 w-full resize-y rounded-3xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />

            <Button type="submit" size="lg" className="lg:self-stretch" disabled={loading || question.trim().length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="ghost"
                size="sm"
                className="border border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                onClick={() => setQuestion(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div aria-live="polite" className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="space-y-2 text-sm leading-relaxed text-zinc-500">
                <p>Try asking about a named person, a headline, a company, or a current event.</p>
                <p>The assistant will search the current news coverage and return a grounded answer.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto max-w-3xl border-zinc-700 bg-zinc-100 text-zinc-950"
                      : "mr-auto max-w-4xl border-zinc-800 bg-zinc-900/80 text-zinc-200"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-zinc-100">
                    {message.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching articles and drafting the answer...
              </div>
            ) : null}

            {error ? <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">{error}</p> : null}
          </div>

          {latestSources.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Top sources</p>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {latestSources.length} matches
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {latestSources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-snug text-zinc-100">{source.title}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                          {source.source} · {formatPublishedAt(source.publishedAt)}
                        </p>
                      </div>

                      <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                        {source.relevance}%
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{source.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.section>
  );
}
