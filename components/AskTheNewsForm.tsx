"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AskTheNewsForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/RefinedFeed?mode=assistant&q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        Ask the news — get sourced answers in seconds.
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Type a question. Distiller searches today&apos;s coverage, finds the strongest match, and answers with the source.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What happened in AI this week?"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          Ask →
        </button>
      </form>
    </div>
  );
}