"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeButton({
  plan,
  label,
  variant = "default"
}: {
  plan: "pro" | "team";
  label: string;
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} className="w-full" disabled={loading} onClick={handleClick}>
      {loading ? "Redirecting..." : label}
    </Button>
  );
}

export function ManageBillingButton({
  label,
  variant = "outline",
  size = "sm"
}: {
  label: string;
  variant?: "default" | "outline";
  size?: "sm" | "default";
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} disabled={loading} onClick={handleClick}>
      {loading ? "Loading..." : label}
    </Button>
  );
}
