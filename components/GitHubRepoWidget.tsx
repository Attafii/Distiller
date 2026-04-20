"use client";

import { useEffect, useState } from "react";

import { Loader2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { normalizeEnvString } from "@/lib/utils";
import type { GitHubRepoStats } from "@/types/news";

const DEFAULT_REPO_SLUG = normalizeEnvString(process.env.NEXT_PUBLIC_GITHUB_REPOSITORY, "Attafii/Distiller");
const DEFAULT_REPO_URL = `https://github.com/${DEFAULT_REPO_SLUG}`;
const DEFAULT_STAR_URL = `https://github.com/login?return_to=${encodeURIComponent(`/${DEFAULT_REPO_SLUG}`)}`;

function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function GitHubRepoWidget() {
  const [stats, setStats] = useState<GitHubRepoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setLoading(true);

      try {
        const response = await fetch("/api/github/stars", {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const payload = (await response.json()) as GitHubRepoStats;
        setStats(payload);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStats(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => controller.abort();
  }, []);

  const repoUrl = stats?.repoUrl ?? DEFAULT_REPO_URL;
  const starUrl = stats?.starUrl ?? DEFAULT_STAR_URL;

  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-2 shadow-soft backdrop-blur">
      <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500 sm:flex">
        <Star className="h-3.5 w-3.5 text-zinc-400" />
        <span>GitHub stars</span>
      </div>

      <Badge variant="outline" className="border-zinc-700 font-mono tabular-nums text-zinc-200">
        {loading ? (
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading
          </span>
        ) : stats ? (
          formatCount(stats.stars)
        ) : (
          "—"
        )}
      </Badge>

      <a
        href={starUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Star ${stats?.repoSlug ?? DEFAULT_REPO_SLUG} on GitHub`}
        title={repoUrl}
        className={buttonStyles({ variant: "secondary", size: "sm", className: "whitespace-nowrap" })}
      >
        <Star className="h-4 w-4" />
        Star repo
      </a>
    </div>
  );
}
