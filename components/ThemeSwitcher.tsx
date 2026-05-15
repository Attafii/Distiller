"use client";

import { useEffect, useState } from "react";

import { Palette } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const THEMES = [
  { id: "ocean", label: "Ocean" },
  { id: "mint", label: "Mint" },
  { id: "sunset", label: "Sunset" },
  { id: "dark", label: "Dark" },
  { id: "spectrum", label: "Spectrum" }
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("ocean");

  useEffect(() => {
    const persisted = window.localStorage.getItem("distiller-theme") as ThemeId | null;
    if (persisted && THEMES.some((option) => option.id === persisted)) {
      setTheme(persisted);
      if (persisted === "ocean") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", persisted);
      }
    }
  }, []);

  const applyTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    window.localStorage.setItem("distiller-theme", nextTheme);

    if (nextTheme === "ocean") {
      document.documentElement.removeAttribute("data-theme");
      return;
    }

    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="border-border text-muted-foreground">
        <Palette className="mr-1.5 h-3.5 w-3.5" />
        Theme
      </Badge>
      {THEMES.map((option) => {
        const active = option.id === theme;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => applyTheme(option.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
