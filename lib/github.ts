import "server-only";

import { fetchWithTimeout } from "@/lib/http";
import { normalizeEnvString } from "@/lib/utils";

const DEFAULT_REPO_SLUG = "Attafii/Distiller";
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface GitHubRepoStats {
  repoSlug: string;
  repoUrl: string;
  starUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  fetchedAt: string;
}

interface CachedGitHubStats {
  expiresAt: number;
  value: GitHubRepoStats;
}

let cachedStats: CachedGitHubStats | null = null;

function cleanRepoSlug(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function getRepoSlug() {
  return cleanRepoSlug(normalizeEnvString(process.env.GITHUB_REPOSITORY, DEFAULT_REPO_SLUG));
}

function getGitHubToken() {
  return normalizeEnvString(process.env.GITHUB_TOKEN ?? process.env.GITHUB_API_TOKEN);
}

export async function getGitHubRepoStats(forceRefresh = false): Promise<GitHubRepoStats> {
  const repoSlug = getRepoSlug();
  const cached = cachedStats && cachedStats.expiresAt > Date.now() ? cachedStats.value : null;

  if (cached && !forceRefresh) {
    return cached;
  }

  const repoUrl = `https://github.com/${repoSlug}`;
  const starUrl = `https://github.com/login?return_to=${encodeURIComponent(`/${repoSlug}`)}`;
  const gitHubToken = getGitHubToken();

  try {
    const response = await fetchWithTimeout(
      `https://api.github.com/repos/${repoSlug}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Distiller",
          ...(gitHubToken ? { Authorization: `Bearer ${gitHubToken}` } : {})
        },
        cache: "no-store"
      },
      5000
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GitHub API request failed with status ${response.status}: ${errorBody}`);
    }

    const payload = (await response.json()) as {
      html_url?: string;
      stargazers_count?: number;
      forks_count?: number;
      open_issues_count?: number;
    };

    const value: GitHubRepoStats = {
      repoSlug,
      repoUrl: payload.html_url ?? repoUrl,
      starUrl,
      stars: payload.stargazers_count ?? 0,
      forks: payload.forks_count ?? 0,
      openIssues: payload.open_issues_count ?? 0,
      fetchedAt: new Date().toISOString()
    };

    cachedStats = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value
    };

    return value;
  } catch (error) {
    if (cached) {
      return cached;
    }

    throw error;
  }
}
