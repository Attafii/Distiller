"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type NotificationToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => Promise<void>;
};

export function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(checked);

  const handleChange = async () => {
    setLoading(true);
    try {
      const newValue = !enabled;
      setEnabled(newValue);
      await onChange(newValue);
    } catch {
      setEnabled(!enabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleChange}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        } ${loading ? "opacity-50" : ""}`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
        ) : (
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        )}
      </button>
    </div>
  );
}
