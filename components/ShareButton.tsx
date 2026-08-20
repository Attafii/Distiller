"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  briefSlug: string;
  bullets?: string[];
  insight?: string;
  sourceName?: string;
  publishedAt?: string;
  url?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

function createSafeSlug(id: string): string {
  // Create a URL-safe slug from the article ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function ShareButton({ title, briefSlug, bullets, insight, sourceName, publishedAt, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const safeSlug = createSafeSlug(briefSlug);
  const params = new URLSearchParams({
    title,
    ...(bullets ? { bullets: JSON.stringify(bullets) } : {}),
    ...(insight ? { insight } : {}),
    ...(sourceName ? { sourceName } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    ...(url ? { url } : {})
  });

  const briefUrl = `${siteUrl}/brief/${safeSlug}?${params.toString()}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(briefUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Link2 className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
