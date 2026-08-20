"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateAlertFormProps = {
  onCreated: () => void;
};

export function CreateAlertForm({ onCreated }: CreateAlertFormProps) {
  const [keyword, setKeyword] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "instant">("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), frequency })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create alert");
      }

      setKeyword("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Enter keyword (e.g. AI, Bitcoin, Tesla)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
          required
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "instant")}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="instant">Instant</option>
        </select>
        <Button type="submit" disabled={loading || !keyword.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Add</span>
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
