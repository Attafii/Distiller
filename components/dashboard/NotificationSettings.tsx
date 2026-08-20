"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationToggle } from "./NotificationToggle";

type NotificationSettingsProps = {
  dailyEmailEnabled: boolean;
  breakingNewsEnabled: boolean;
  weeklySummaryEnabled: boolean;
};

export function NotificationSettings({
  dailyEmailEnabled,
  breakingNewsEnabled,
  weeklySummaryEnabled
}: NotificationSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const updatePreference = async (field: string, value: boolean) => {
    setError(null);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });

      if (!res.ok) {
        throw new Error("Failed to update preference");
      }

      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <NotificationToggle
        label="Daily digest email"
        description="Receive a daily summary of top stories"
        checked={dailyEmailEnabled}
        onChange={(value) => updatePreference("dailyEmailEnabled", value)}
      />
      <NotificationToggle
        label="Breaking news alerts"
        description="Get notified for breaking news in your topics"
        checked={breakingNewsEnabled}
        onChange={(value) => updatePreference("breakingNewsEnabled", value)}
      />
      <NotificationToggle
        label="Weekly summary"
        description="A weekly recap of your reading activity"
        checked={weeklySummaryEnabled}
        onChange={(value) => updatePreference("weeklySummaryEnabled", value)}
      />
    </div>
  );
}
