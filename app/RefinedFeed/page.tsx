"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Newspaper, RefreshCcw, Search, SlidersHorizontal, X, Menu } from "lucide-react";

import { DistilledCard } from "@/components/DistilledCard";
import { GitHubRepoWidget } from "@/components/GitHubRepoWidget";
import { NewsArticleModal } from "@/components/NewsArticleModal";
import { NewsAssistant } from "@/components/NewsAssistant";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPriorityLabel } from "@/lib/article-signals";
import { COUNTRY_OPTIONS, DATE_RANGE_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";
import type { ArticleLikeResponse, ArticlePriority, Category, CountryCode, DateRange, DistilledArticle, FeedResponse, SummarizationMode } from "@/types/news";

const summaryModes: Array<{ id: SummarizationMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "deep", label: "Deep" }
];

const priorityFilters: Array<{ id: ArticlePriority | "all"; label: string }> = [
  { id: "all", label: "All signals" },
  { id: "important", label: "Important" },
  { id: "breaking", label: "Breaking" }
];

const GUEST_FREE_ARTICLES = 4;
const GUEST_ALLOWED_TOPICS: Array<{ id: Category; label: string }> = [
  { id: "world", label: "World" },
  { id: "tech", label: "Technology" }
];

function FeedSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="mb-4 h-4 w-28 rounded-full bg-muted" />
          <div className="mb-3 h-6 w-4/5 rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-16 rounded-2xl bg-muted/80" />
            <div className="h-16 rounded-2xl bg-muted/80" />
            <div className="h-16 rounded-2xl bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-border bg-card/70">
      <CardContent className="px-6 py-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function RefinedFeedPage() {
  const [isGuest, setIsGuest] = useState(true);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [category, setCategory] = useState<Category>("world");
  const [country, setCountry] = useState<CountryCode>("global");
  const [dateRange, setDateRange] = useState<DateRange>("any");
  const [summaryMode, setSummaryMode] = useState<SummarizationMode>("auto");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<ArticlePriority | "all">("all");
  const [articles, setArticles] = useState<DistilledArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticleStartExpanded, setSelectedArticleStartExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/get-user");
        setIsGuest(!res.ok);
        if (!res.ok) {
          setCategory("world");
          setCountry("global");
        }
      } catch {
        setIsGuest(true);
        setCategory("world");
        setCountry("global");
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      if (isGuest && guestLimitReached) {
        setLoading(false);
        return;
      }

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
        if (data.guestLimitReached) {
          setGuestLimitReached(true);
          setHasMore(false);
        }
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
    setSelectedArticleId(null);
    setSelectedArticleStartExpanded(false);
    setGuestLimitReached(false);
  };

  const resetFeed = (nextCategory: Category, nextMode = summaryMode) => {
    if (isGuest && !GUEST_ALLOWED_TOPICS.some((t) => t.id === nextCategory)) {
      return;
    }
    setCategory(nextCategory);
    setSummaryMode(nextMode);
    resetResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateCountry = (nextCountry: CountryCode) => {
    if (isGuest && nextCountry !== "global") {
      return;
    }
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

  const handleOpenArticle = (article: DistilledArticle) => {
    setSelectedArticleId(article.id);
    setSelectedArticleStartExpanded(true);
  };

  const closeArticle = () => {
    setSelectedArticleId(null);
    setSelectedArticleStartExpanded(false);
  };

  const handleShareArticle = async (article: DistilledArticle) => {
    const sharePayload = {
      title: article.title,
      text: article.description ?? article.summary.insight,
      url: article.url
    };

    try {
      const browserNavigator = window.navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
        clipboard?: Clipboard;
      };

      if (typeof browserNavigator.share === "function") {
        await browserNavigator.share(sharePayload);
        return;
      }

      if (browserNavigator.clipboard) {
        await browserNavigator.clipboard.writeText(`${article.title}\n${article.url}`);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Unable to share article", error);
      }
    }
  };

  const handleLikeArticle = async (article: DistilledArticle) => {
    if (article.likedByViewer) {
      return;
    }

    try {
      const response = await fetch("/api/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ articleId: article.id })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as ArticleLikeResponse;

      setArticles((current) =>
        current.map((item) =>
          item.id === payload.articleId
            ? {
                ...item,
                likeCount: payload.likeCount,
                likedByViewer: payload.likedByViewer
              }
            : item
        )
      );
    } catch (error) {
      console.error("Unable to like article", error);
    }
  };

  const handleBookmarkArticle = async (article: DistilledArticle) => {
    try {
      if (article.bookmarked) {
        const response = await fetch(`/api/bookmarks?articleId=${encodeURIComponent(article.id)}`, {
          method: "DELETE"
        });
        if (!response.ok && response.status !== 404) {
          throw new Error(await response.text());
        }
        setArticles((current) =>
          current.map((item) =>
            item.id === article.id
              ? { ...item, bookmarked: false }
              : item
          )
        );
      } else {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            articleId: article.id,
            title: article.title,
            url: article.url,
            imageUrl: article.imageUrl,
            description: article.description,
            source: article.source.name,
            category: article.category,
            publishedAt: article.publishedAt
          })
        });

        if (!response.ok) {
          if (response.status === 409) {
            return;
          }
          throw new Error(await response.text());
        }

        setArticles((current) =>
          current.map((item) =>
            item.id === article.id
              ? { ...item, bookmarked: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Unable to bookmark article", error);
    }
  };

  const activeTopicLabel = TOPIC_OPTIONS.find((option) => option.id === category)?.label ?? category;
  const activeCountryLabel = COUNTRY_OPTIONS.find((option) => option.id === country)?.label ?? country;
  const activeDateLabel = DATE_RANGE_OPTIONS.find((option) => option.id === dateRange)?.label ?? dateRange;
  const activePriorityLabel = priorityFilters.find((option) => option.id === priorityFilter)?.label ?? priorityFilter;
  const visibleArticles = articles.filter((article) => (priorityFilter === "all" ? true : article.priority === priorityFilter));
  const selectedArticle = selectedArticleId ? articles.find((article) => article.id === selectedArticleId) ?? null : null;
  const emptyTitle = articles.length > 0 ? "No stories match this filter" : "No articles yet";
  const emptyDescription =
    articles.length > 0
      ? priorityFilter === "all"
        ? "Try another topic, switch the region, or change the summary mode to load a different briefing style."
        : `The current feed does not have any ${activePriorityLabel.toLowerCase()} stories yet. Clear the priority filter or pick another topic.`
      : "Try another topic, switch the region, or change the summary mode to load a different briefing style.";

  return (
    <main className="min-h-screen bg-transparent text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-border bg-white/85 px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Distiller</p>
              <p className="text-xs text-muted-foreground">Refined feed</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-3 sm:flex">
              <UserNav />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted sm:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-foreground" />
              ) : (
                <Menu className="h-4 w-4 text-foreground" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 right-0 z-50 sm:hidden"
                style={{ top: "90px" }}
              >
                <div className="mx-4 rounded-2xl border border-border bg-card shadow-soft">
                  <nav className="p-4">
                    <div className="space-y-1">
                      {[
                        { href: "/RefinedFeed", label: "Browse", icon: Newspaper },
                        { href: "/pricing", label: "Pricing", icon: SlidersHorizontal },
                        { href: "/auth/login", label: "Sign in", icon: null },
                        { href: "/auth/signup", label: "Get started", icon: null }
                      ].map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                              item.href === "/RefinedFeed"
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <NewsAssistant category={category} country={country} dateRange={dateRange} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8 grid gap-5 rounded-3xl border border-border bg-white/75 p-6 shadow-soft lg:grid-cols-[1.25fr_0.75fr] lg:p-8"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="border-border text-muted-foreground">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Verified + distilled
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Refine the global feed into signals you can scan in seconds.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Distiller fetches stories from our API-backed pipeline, grounds them with embeddings, and uses RAG to
                render exactly three concise bullets per article.
              </p>
            </div>
          </div>

          <Card className="border-border bg-card/90">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="default">Current mode</Badge>
                <Badge variant="outline">{summaryMode}</Badge>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>Category: <span className="text-foreground">{activeTopicLabel}</span></p>
                <p>Region: <span className="text-foreground">{activeCountryLabel}</span></p>
                <p>Date window: <span className="text-foreground">{activeDateLabel}</span></p>
                <p>Articles loaded: <span className="text-foreground">{articles.length}</span></p>
                <p>Visible after filters: <span className="text-foreground">{visibleArticles.length}</span></p>
                <p>Priority filter: <span className="text-foreground">{activePriorityLabel}</span></p>
                <p>Infinite scroll: <span className="text-foreground">{hasMore ? "active" : "complete"}</span></p>
                <p>Source verification: <span className="text-foreground">enabled</span></p>
                <p>Smart matching: <span className="text-foreground">active</span></p>
                <p className="text-xs text-muted-foreground">Red dot means important or breaking news.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <form
          onSubmit={submitSearch}
          className="mb-4 grid gap-3 rounded-3xl border border-border bg-card/80 p-4 shadow-soft sm:grid-cols-[1fr_auto_auto]"
        >
          <label htmlFor="distiller-search" className="sr-only">
            Search news topics
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="distiller-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search topics, regions, or headlines"
              className="h-11 w-full rounded-full border border-border bg-card/90 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
            <span>Search:</span>
            <Badge variant="outline" className="border-border text-muted-foreground normal-case tracking-normal">
              {searchQuery}
            </Badge>
          </div>
        ) : null}

        <Card className="mb-4 border-border bg-card/80 shadow-soft">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Use the topic chips to widen or narrow the story set, the region chips to focus on Tunisia, China, Russia, or another market,
              and the mode chips to switch between faster and deeper summaries.
            </p>

            <div className="grid gap-4 xl:grid-cols-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Topics</p>
                  {isGuest && (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      Free: {GUEST_FREE_ARTICLES} articles/day
                    </Badge>
                  )}
                  {!isGuest && (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      {TOPIC_OPTIONS.length} topics
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isGuest
                    ? GUEST_ALLOWED_TOPICS.map((option) => {
                        const active = option.id === category;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => resetFeed(option.id)}
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              active
                                ? "border-primary bg-primary-foreground text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })
                    : TOPIC_OPTIONS.map((option) => {
                        const active = option.id === category;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => resetFeed(option.id)}
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              active
                                ? "border-primary bg-primary-foreground text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
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
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Region</p>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {activeCountryLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isGuest ? (
                    <span className="rounded-full border border-border bg-card px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Global only
                    </span>
                  ) : (
                    COUNTRY_OPTIONS.map((option) => {
                      const active = option.id === country;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateCountry(option.id)}
                          className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                            active
                              ? "border-primary bg-primary-foreground text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Date range</p>
                  <Badge variant="outline" className="border-border text-muted-foreground">
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
                            ? "border-primary bg-primary-foreground text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
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
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Priority</p>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {activePriorityLabel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {priorityFilters.map((option) => {
                    const active = option.id === priorityFilter;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPriorityFilter(option.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                          active
                            ? "border-red-400/70 bg-red-500/15 text-red-50"
                            : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                        }`}
                      >
                        {option.id === "all" ? null : <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.75)]" />}
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
                          ? "border-primary bg-primary-foreground text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
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
          <Card className="mb-6 border-border bg-card/90">
            <CardContent className="space-y-2 px-6 py-5">
              <p className="text-sm font-medium text-foreground">Unable to load the feed</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        {loading && articles.length === 0 ? <FeedSkeleton /> : null}

        {!loading && visibleArticles.length === 0 && !error ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : null}

        {visibleArticles.length > 0 ? (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {visibleArticles.map((article) => (
                <DistilledCard
                  key={article.id}
                  article={article}
                  onOpenAction={handleOpenArticle}
                  onLikeAction={handleLikeArticle}
                  onShareAction={handleShareArticle}
                  onBookmarkAction={handleBookmarkArticle}
                />
              ))}
            </div>

            {isGuest && guestLimitReached && (
              <div className="relative mt-6 rounded-3xl border border-border bg-card/40 p-8 text-center backdrop-blur-sm">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent to-background/80" />
                <div className="relative space-y-4">
                  <div>
                    <p className="text-lg font-semibold">You have reached your free daily limit</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a free account to get {GUEST_FREE_ARTICLES} free articles every day, unlimited bookmarks,
                      personalized alerts, and more.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button asChild>
                      <Link href="/auth/signup">Create free account</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/pricing">View pricing</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        <div ref={sentinelRef} className="h-12" />

        {loading && articles.length > 0 ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more stories
          </div>
        ) : null}

        {!hasMore && articles.length > 0 ? (
          <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            You reached the end of the current feed
          </p>
        ) : null}
      </section>

      <NewsArticleModal
        article={selectedArticle}
        open={Boolean(selectedArticle)}
        onCloseAction={closeArticle}
        onLikeAction={handleLikeArticle}
        onShareAction={handleShareArticle}
        initialShowFullText={selectedArticleStartExpanded}
      />
    </main>
  );
}
