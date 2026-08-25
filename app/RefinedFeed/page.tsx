"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Newspaper, RefreshCcw, Search } from "lucide-react";

import { DistilledCard } from "@/components/DistilledCard";
import { NewsArticleModal } from "@/components/NewsArticleModal";
import { NewsAssistant } from "@/components/NewsAssistant";
import { COUNTRY_OPTIONS, DATE_RANGE_OPTIONS, TOPIC_OPTIONS } from "@/lib/news-options";
import { DEMO_ARTICLES } from "@/lib/demo-articles";
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

const GUEST_FREE_ARTICLES = 50;
const GUEST_ALLOWED_TOPICS: Array<{ id: Category; label: string }> = [
  { id: "world", label: "World" },
  { id: "tech", label: "Technology" }
];

function FeedSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-line bg-surface p-6">
          <div className="t-mono mb-4 text-faint">distilling</div>
          <div className="mb-3 h-5 w-4/5 rounded-md bg-surface-2" />
          <div className="space-y-2.5">
            <div className="h-3 w-full rounded-full bg-surface-2/80" />
            <div className="h-3 w-11/12 rounded-full bg-surface-2/80" />
            <div className="h-3 w-3/4 rounded-full bg-surface-2/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-14 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-paper">
        <Newspaper className="h-4.5 w-4.5" width={18} height={18} />
      </span>
      <p className="t-micro mt-5 text-ember">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = "ember"
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "ember" | "brass" | "rose";
}) {
  const activeTone =
    tone === "brass"
      ? "border-brass bg-brass/10 text-brass"
      : tone === "rose"
        ? "border-rose bg-rose/10 text-rose"
        : "border-ember bg-ember/10 text-ember";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`t-mono shrink-0 rounded-full border px-3 py-1 transition ${
        active ? activeTone : "border-line text-muted hover:border-ember/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
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
  const [assistantQuery, setAssistantQuery] = useState<string | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlCountry = searchParams.get("country");
    const urlQuery = searchParams.get("q") ?? searchParams.get("query");
    const urlMode = searchParams.get("mode");

    if (urlCategory && TOPIC_OPTIONS.some((o) => o.id === urlCategory)) {
      setCategory(urlCategory as Category);
    }
    if (urlCountry && COUNTRY_OPTIONS.some((o) => o.id === urlCountry)) {
      setCountry(urlCountry as CountryCode);
    }
    if (urlQuery) {
      setSearchTerm(urlQuery);
      setSearchQuery(urlQuery);
    }
    if (urlMode === "assistant" && urlQuery) {
      setAssistantQuery(urlQuery);
    } else if (urlMode && ["auto", "fast", "balanced", "deep"].includes(urlMode)) {
      setSummaryMode(urlMode as SummarizationMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [category, country, dateRange, guestLimitReached, isGuest, page, searchQuery, summaryMode]);

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

  const handleOpenArticle = useCallback((article: DistilledArticle) => {
    setSelectedArticleId(article.id);
  }, []);

  const closeArticle = useCallback(() => {
    setSelectedArticleId(null);
  }, []);

  const handleShareArticle = useCallback(async (article: DistilledArticle) => {
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
  }, []);

  const handleLikeArticle = useCallback(async (article: DistilledArticle) => {
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
  }, []);

  const handleBookmarkArticle = useCallback(async (article: DistilledArticle) => {
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
  }, []);

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
      <section className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8 py-8">
        <NewsAssistant category={category} country={country} dateRange={dateRange} initialQuery={assistantQuery} />

        {/* search */}
        <form
          onSubmit={submitSearch}
          className="mb-3 grid gap-2.5 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[1fr_auto_auto]"
        >
          <label htmlFor="distiller-search" className="sr-only">
            Search news topics
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="distiller-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search topics, regions, or headlines"
              className="h-10 w-full rounded-lg border border-line bg-paper pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-ember focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="sheen h-10 rounded-lg bg-ink px-5 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-ember"
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearSearch}
            className="h-10 rounded-lg border border-line px-4 text-sm font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            Clear
          </button>
        </form>

        {searchQuery ? (
          <div className="t-mono mb-4 flex flex-wrap items-center gap-2 text-faint">
            <span>search ·</span>
            <span className="rounded-full border border-ember/40 bg-ember/10 px-3 py-0.5 normal-case tracking-normal text-ember">
              {searchQuery}
            </span>
          </div>
        ) : null}

        {/* filters */}
        <div className="mb-6 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="t-micro text-faint">topics</p>
                <p className="t-mono text-faint">
                  {isGuest ? `free · ${GUEST_FREE_ARTICLES}/mo` : `${TOPIC_OPTIONS.length} topics`}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(isGuest ? GUEST_ALLOWED_TOPICS : TOPIC_OPTIONS).map((option) => (
                  <Chip key={option.id} active={option.id === category} onClick={() => resetFeed(option.id)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="t-micro text-faint">region · {activeCountryLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {isGuest ? (
                  <span className="t-mono rounded-full border border-dashed border-line px-3 py-1 text-faint">
                    global only · pro
                  </span>
                ) : (
                  COUNTRY_OPTIONS.map((option) => (
                    <Chip
                      key={option.id}
                      active={option.id === country}
                      onClick={() => updateCountry(option.id)}
                    >
                      {option.label}
                    </Chip>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="t-micro text-faint">date · {activeDateLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <Chip
                    key={option.id}
                    active={option.id === dateRange}
                    onClick={() => updateDateRange(option.id)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="t-micro text-faint">priority · {activePriorityLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {priorityFilters.map((option) => {
                  const active = option.id === priorityFilter;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPriorityFilter(option.id)}
                      className={`t-mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 transition ${
                        active && option.id !== "all"
                          ? "border-rose bg-rose/10 text-rose"
                          : active
                            ? "border-ember bg-ember/10 text-ember"
                            : "border-line text-muted hover:border-ember/50 hover:text-ink"
                      }`}
                    >
                      {option.id === "breaking" ? (
                        <span className={`h-1.5 w-1.5 rounded-full bg-rose ${active ? "pulse" : ""}`} />
                      ) : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <span className="t-micro text-faint">depth</span>
            <div className="flex flex-wrap gap-1.5">
              {summaryModes.map((mode) => (
                <Chip
                  key={mode.id}
                  active={mode.id === summaryMode}
                  onClick={() => updateMode(mode.id)}
                  tone={mode.id === "deep" ? "brass" : "ember"}
                >
                  {mode.id === "deep" ? "deep · pro" : mode.label}
                </Chip>
              ))}
            </div>

            <button
              type="button"
              onClick={refreshFeed}
              className="t-mono ml-auto inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-muted transition hover:border-ink hover:text-ink"
            >
              <RefreshCcw width={11} height={11} />
              refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-ember/40 bg-ember-soft/30 px-5 py-4">
            <p className="t-micro text-ember">the still jammed</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{error}</p>
          </div>
        ) : null}

        {loading && articles.length === 0 ? <FeedSkeleton /> : null}

        {!loading && visibleArticles.length === 0 && !error && !isGuest ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : null}

        {isGuest && !loading && articles.length === 0 && !error ? (
          <>
            <div className="mb-6 flex items-center gap-3.5 rounded-xl border border-ember/30 bg-ember-soft/30 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                <Newspaper width={16} height={16} />
              </span>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-ink">Sign in to unlock your full personalized feed.</span>{" "}
                <span className="text-muted">These are sample previews to show you how Distiller works.</span>
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {DEMO_ARTICLES.map((article) => (
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
          </>
        ) : null}

        {visibleArticles.length > 0 ? (
          <>
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
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
              <div className="animated-border animated-border-pro relative mt-8 overflow-hidden rounded-xl border border-line bg-surface p-8 text-center">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brass/10 blur-2xl" />
                <div className="relative space-y-4">
                  <span className="t-micro inline-block rounded-full bg-brass/20 px-3 py-0.5 text-brass">the cut</span>
                  <p className="t-h3 font-display font-semibold text-ink">
                    You have reached your free limit
                  </p>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                    Create a free account for {GUEST_FREE_ARTICLES} articles every day, unlimited bookmarks,
                    personalized alerts — or go Pro and keep only the heart.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <Link
                      href="/auth/signup"
                      className="sheen rounded-lg bg-gradient-to-r from-ember via-ember-2 to-brass px-6 py-2.5 text-sm font-semibold text-paper shadow-lg transition hover:brightness-105"
                    >
                      Create free account
                    </Link>
                    <Link
                      href="/pricing"
                      className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ember hover:text-ember"
                    >
                      View pricing
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        <div ref={sentinelRef} className="h-12" />

        {loading && articles.length > 0 ? (
          <div className="t-mono mt-6 flex items-center justify-center gap-2 text-muted">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-ember" />
            loading more stories
          </div>
        ) : null}

        {!hasMore && articles.length > 0 ? (
          <div className="mt-10">
            <div className="rule">
              <span className="t-micro text-faint">end of the current feed</span>
            </div>
          </div>
        ) : null}
      </section>

      <NewsArticleModal
        article={selectedArticle}
        open={Boolean(selectedArticle)}
        onCloseAction={closeArticle}
        onLikeAction={handleLikeArticle}
        onShareAction={handleShareArticle}
      />
    </main>
  );
}
