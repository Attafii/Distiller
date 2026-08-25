"use client";

import { useEffect, useState } from "react";
import { ShieldIcon } from "@/components/icons";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("distiller-cookie-choice")) {
      const t = setTimeout(() => setVisible(true), 1100);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem("distiller-cookie-choice", value);
    setVisible(false);
  };

  return (
    <div className="reveal-in fixed bottom-4 left-4 z-[60] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-deep)]">
      <div className="h-0.5 bg-gradient-to-r from-ember via-brass to-teal" />
      <div className="p-4">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-teal">
          <ShieldIcon width={11} height={11} /> privacy
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We use a session cookie for authentication. No tracking or advertising
          cookies.{" "}
          <a
            href="/legal/privacy"
            className="underline-draw text-ink hover:text-ember"
          >
            Learn more
          </a>
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-md border border-line px-3.5 py-1.5 text-sm font-medium text-muted transition hover:border-ink hover:text-ink"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-md bg-ink px-3.5 py-1.5 text-sm font-semibold text-paper transition hover:bg-ember"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
