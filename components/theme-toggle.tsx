"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("distiller-theme");
    const resolved: "light" | "dark" =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(resolved);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("distiller-theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink ${className}`}
    >
      {theme === "dark" ? (
        <SunIcon width={16} height={16} />
      ) : (
        <MoonIcon width={16} height={16} />
      )}
    </button>
  );
}
