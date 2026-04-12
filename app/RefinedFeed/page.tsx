"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Loader2, Newspaper, RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { DistilledCard } from "@/components/DistilledCard";
import { NewsArticleModal } from "@/components/NewsArticleModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRY_OPTIONS, DATE_RANGE_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";
import type { Category, CountryCode, DateRange, DistilledArticle, FeedResponse, SummarizationMode } from "@/types/news";

const summaryModes: Array<{ id: SummarizationMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "deep", label: "Deep" }
];

function FeedSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft"
        >
          <div className="mb-4 h-4 w-28 rounded-full bg-zinc-800" />
          <div className="mb-3 h-6 w-4/5 rounded-full bg-zinc-800" />
          <div className="space-y-3">
            <div className="h-16 rounded-2xl bg-zinc-800/80" />
            <div className="h-16 rounded-2xl bg-zinc-800/80" />
            <div className="h-16 rounded-2xl bg-zinc-800/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70">
      <CardContent className="px-6 py-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">No articles yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
          Try another topic, switch the region, or change the summary mode to load a different briefing style.
        </p>
      </CardContent>
    </Card>
  );
}

export default function RefinedFeedPage() {
  const [category, setCategory] = useState<Category>("tech");
  const [country, setCountry] = useState<CountryCode>("global");
  const [dateRange, setDateRange] = useState<DateRange>("any");
  const [summaryMode, setSummaryMode] = useState<SummarizationMode>("auto");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<DistilledArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DistilledArticle | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          country,
          dateRange,
          page: String(page),
          pageSize: "6",
          mode: summaryMode
        });

        if (searchQuery) {
          params.set("query", searchQuery);
        }

        const response = await fetch(`/api/feed?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load feed");
        }

        const data = (await response.json()) as FeedResponse;

        setArticles((current) => (page === 1 ? data.articles : [...current, ...data.articles]));
        setHasMore(data.hasMore);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
    return () => controller.abort();
  }, [category, country, dateRange, page, searchQuery, summaryMode]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasMore || articles.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [articles.length, hasMore, loading]);

  const resetResults = () => {
    setPage(1);
    setArticles([]);
    setHasMore(true);
    setLoading(true);
    setError(null);
    setSelectedArticle(null);
  };

  const resetFeed = (nextCategory: Category, nextMode = summaryMode) => {
    setCategory(nextCategory);
    setSummaryMode(nextMode);
    resetResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateCountry = (nextCountry: CountryCode) => {
    setCountry(nextCountry);
    resetResults();
  };

  const updateDateRange = (nextDateRange: DateRange) => {
    setDateRange(nextDateRange);
    resetResults();
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    setSearchQuery(trimmed.length > 0 ? trimmed : undefined);
    resetResults();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchQuery(undefined);
    resetResults();
  };

  const updateMode = (nextMode: SummarizationMode) => {
    setSummaryMode(nextMode);
    resetResults();
  };

  const refreshFeed = () => {
    resetResults();
  };

  const activeTopicLabel = TOPIC_OPTIONS.find((option) => option.id === category)?.label ?? category;
  const activeCountryLabel = COUNTRY_OPTIONS.find((option) => option.id === country)?.label ?? country;
  const activeDateLabel = DATE_RANGE_OPTIONS.find((option) => option.id === dateRange)?.label ?? dateRange;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-100">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-zinc-500">Refined feed</p>
            </div>
          </Link>

          <Badge variant="outline" className="hidden border-zinc-700 text-zinc-400 sm:inline-flex">
            RAG + embeddings + our AI and API service
          </Badge>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8 grid gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-soft lg:grid-cols-[1.25fr_0.75fr] lg:p-8"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Topic + region routing
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Refine the global feed into signals you can scan in seconds.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                Distiller fetches stories from our API-backed pipeline, grounds them with embeddings, and uses RAG to
                render exactly three concise bullets per article.
              </p>
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="default">Current mode</Badge>
                <Badge variant="outline">{summaryMode}</Badge>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>Category: <span className="text-zinc-100">{activeTopicLabel}</span></p>
                <p>Region: <span className="text-zinc-100">{activeCountryLabel}</span></p>
                <p>Date window: <span className="text-zinc-100">{activeDateLabel}</span></p>
                <p>Articles loaded: <span className="text-zinc-100">{articles.length}</span></p>
                <p>Infinite scroll: <span className="text-zinc-100">{hasMore ? "active" : "complete"}</span></p>
                <p>RAG: <span className="text-zinc-100">enabled</span></p>
                <p>Embeddings: <span className="text-zinc-100">active</span></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <form
          onSubmit={submitSearch}
          className="mb-4 grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-soft sm:grid-cols-[1fr_auto_auto]"
        >
          <label htmlFor="distiller-search" className="sr-only">
            Search news topics
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="distiller-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search topics, regions, or headlines"
              className="h-11 w-full rounded-full border border-zinc-800 bg-zinc-950/80 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="default" size="sm">
            Search
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        </form>

        {searchQuery ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-zinc-500">
            <span>Search:</span>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300 normal-case tracking-normal">
              {searchQuery}
            </Badge>
          </div>
        ) : null}

        <Card className="mb-4 border-zinc-800 bg-zinc-900/60 shadow-soft">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <p className="max-w-4xl text-sm leading-relaxed text-zinc-400">
              Use the topic chips to widen or narrow the story set, the region chips to focus on Tunisia or another market,
              and the mode chips to switch between faster and deeper summaries.
            </p>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Topics</p>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                    {TOPIC_OPTIONS.length} topics
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {TOPIC_OPTIONS.map((option) => {
                    const active = option.id === category;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => resetFeed(option.id)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Region</p>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                    {activeCountryLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COUNTRY_OPTIONS.map((option) => {
                    const active = option.id === country;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateCountry(option.id)}
                        className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                          active
                            ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Date range</p>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                    {activeDateLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DATE_RANGE_OPTIONS.map((option) => {
                    const active = option.id === dateRange;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateDateRange(option.id)}
                        className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                          active
                            ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {summaryModes.map((mode) => {
                const active = mode.id === summaryMode;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateMode(mode.id)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${
                      active
                        ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-100"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}

              <Button variant="secondary" size="sm" className="ml-auto" onClick={refreshFeed}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="mb-6 border-zinc-800 bg-zinc-900/70">
            <CardContent className="space-y-2 px-6 py-5">
              <p className="text-sm font-medium text-zinc-100">Unable to load the feed</p>
              <p className="text-sm leading-relaxed text-zinc-400">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        {loading && articles.length === 0 ? <FeedSkeleton /> : null}

        {!loading && articles.length === 0 && !error ? <EmptyState /> : null}

        {articles.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {articles.map((article) => (
              <DistilledCard key={article.id} article={article} onOpenAction={setSelectedArticle} />
            ))}
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-12" />

        {loading && articles.length > 0 ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more stories
          </div>
        ) : null}

        {!hasMore && articles.length > 0 ? (
          <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
            You reached the end of the current feed
          </p>
        ) : null}
      </section>

      <NewsArticleModal
        article={selectedArticle}
        open={Boolean(selectedArticle)}
        onCloseAction={() => setSelectedArticle(null)}
      />
    </main>
  );
}
