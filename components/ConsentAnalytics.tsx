"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function ConsentAnalytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Check if user has accepted cookies
    const cookieConsent = localStorage.getItem("cookie_consent");
    if (cookieConsent === "all") {
      setConsent(true);
    }

    // Listen for consent changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cookie_consent") {
        setConsent(e.newValue === "all");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!consent) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
