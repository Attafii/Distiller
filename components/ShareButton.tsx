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

export function ShareButton({ title, briefSlug, bullets, insight, sourceName, publishedAt, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams({
    title: encodeURIComponent(title),
    ...(bullets ? { bullets: encodeURIComponent(JSON.stringify(bullets)) } : {}),
    ...(insight ? { insight: encodeURIComponent(insight) } : {}),
    ...(sourceName ? { sourceName: encodeURIComponent(sourceName) } : {}),
    ...(publishedAt ? { publishedAt: encodeURIComponent(publishedAt) } : {}),
    ...(url ? { url: encodeURIComponent(url) } : {})
  });

  const briefUrl = `${siteUrl}/brief/${briefSlug}?${params.toString()}`;

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