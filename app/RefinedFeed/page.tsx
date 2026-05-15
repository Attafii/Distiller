"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Newspaper, RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { DistilledCard } from "@/components/DistilledCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRY_OPTIONS, DATE_RANGE_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";
import type { Category, CountryCode, DateRange, DistilledArticle, FeedResponse, SummarizationMode } from "@/types/news";

const NewsArticleModal = dynamic(
  () => import("@/components/NewsArticleModal").then((mod) => mod.NewsArticleModal),
  { ssr: false, loading: () => null }
);

const summaryModes: Array<{ id: SummarizationMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "deep", label: "Deep" }
];

function FeedSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2" role="status" aria-label="Loading articles">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="mb-4 h-4 w-24 rounded-full bg-muted" />
          <div className="mb-3 h-5 w-4/5 rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-14 rounded-xl bg-muted" />
            <div className="h-14 rounded-xl bg-muted" />
            <div className="h-14 rounded-xl bg-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading more articles...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-border bg-card" role="status">
      <CardContent className="px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Newspaper className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">No articles found</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Try adjusting your filters, switching regions, or clearing your search to discover new stories.
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
  const requestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestIdRef.current;

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

        if (response.ok && currentRequestId === requestIdRef.current) {
          const data = (await response.json()) as FeedResponse;

          setArticles((current) => (page === 1 ? data.articles : [...current, ...data.articles]));
          setHasMore(data.hasMore);
        } else if (currentRequestId !== requestIdRef.current) {
          return;
        }
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        if (currentRequestId === requestIdRef.current) {
          setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
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
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Distiller",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.news",
            description: "AI-powered news intelligence with RAG-grounded summaries.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.news"}/RefinedFeed?query={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8" id="main-content" role="main" aria-label="News feed">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">Refined feed</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden border-border text-muted-foreground sm:inline-flex font-normal">
              RAG · embeddings · NVIDIA Build
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8 grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-card lg:grid-cols-[1.25fr_0.75fr] lg:p-8"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/20 text-primary font-medium">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Smart filtering
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Refine the feed into signals you can scan in seconds.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                AI-powered summaries grounded with RAG and embeddings. Three concise bullets per story, sourced from top news.
              </p>
            </div>
          </div>

          <Card className="border-border bg-muted/30">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="default" className="font-medium">Current mode</Badge>
                <Badge variant="outline" className="font-mono text-xs">{summaryMode}</Badge>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground">{activeTopicLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Region</dt>
                  <dd className="font-medium text-foreground">{activeCountryLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Window</dt>
                  <dd className="font-medium text-foreground">{activeDateLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Articles</dt>
                  <dd className="font-medium text-foreground tabular-nums">{articles.length}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>

        <form
          onSubmit={submitSearch}
          className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-[1fr_auto_auto]"
          role="search"
          aria-label="Search news"
        >
          <label htmlFor="distiller-search" className="sr-only">
            Search news topics
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="distiller-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search topics, regions, or headlines"
              className="h-11 w-full rounded-xl border border-input bg-background px-4 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <Button type="submit" variant="default" size="sm">
            <span className="hidden sm:inline">Search</span>
            <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          </Button>

          <Button type="button" variant="secondary" size="sm" onClick={clearSearch}>
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Clear</span>
          </Button>
        </form>

        {searchQuery ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" role="status">
            <span className="font-medium">Active search:</span>
            <Badge variant="outline" className="normal-case font-normal">
              {searchQuery}
            </Badge>
          </div>
        ) : null}

        <Card className="mb-4 border-border bg-card shadow-card">
          <CardContent className="space-y-6 p-4 sm:p-6">
            <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Filter by topic, region, and date to curate your personal news briefing.
            </p>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Topics</p>
                  <Badge variant="outline" className="text-xs">
                    {TOPIC_OPTIONS.length}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Topic categories">
                  {TOPIC_OPTIONS.map((option) => {
                    const active = option.id === category;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => resetFeed(option.id)}
                        aria-pressed={active}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Region</p>
                  <Badge variant="outline" className="text-xs">
                    {activeCountryLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Country regions">
                  {COUNTRY_OPTIONS.map((option) => {
                    const active = option.id === country;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateCountry(option.id)}
                        aria-pressed={active}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Date range</p>
                  <Badge variant="outline" className="text-xs">
                    {activeDateLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Date ranges">
                  {DATE_RANGE_OPTIONS.map((option) => {
                    const active = option.id === dateRange;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateDateRange(option.id)}
                        aria-pressed={active}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Summary modes">
                {summaryModes.map((mode) => {
                  const active = mode.id === summaryMode;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateMode(mode.id)}
                      aria-pressed={active}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <Button variant="secondary" size="sm" onClick={refreshFeed} className="ml-auto">
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="mb-6 border-destructive/50 bg-destructive/5" role="alert" aria-live="polite">
            <CardContent className="flex items-start gap-4 px-6 py-5">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">Unable to load the feed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={refreshFeed} className="shrink-0">
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {loading && articles.length === 0 ? <FeedSkeleton /> : null}

        {!loading && articles.length === 0 && !error ? <EmptyState /> : null}

        {articles.length > 0 ? (
          <section aria-label="News articles" className="grid gap-5 lg:grid-cols-2" role="feed">
            {articles.map((article, index) => (
              <DistilledCard
                key={article.id}
                article={article}
                onOpenAction={setSelectedArticle}
                priority={index < 4}
              />
            ))}
          </section>
        ) : null}

        <div ref={sentinelRef} className="h-12" aria-hidden="true" />

        {loading && articles.length > 0 ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Loading more stories...</span>
          </div>
        ) : null}

        {!hasMore && articles.length > 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground" role="status">
            You&apos;ve reached the end of the current feed
          </p>
        ) : null}
      </section>

      <AnimatePresence mode="wait">
          <NewsArticleModal
            key={selectedArticle?.id ?? "modal"}
            article={selectedArticle}
            open={Boolean(selectedArticle)}
            onCloseAction={() => setSelectedArticle(null)}
          />
        </AnimatePresence>
    </main>
  );
}
