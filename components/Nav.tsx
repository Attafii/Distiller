"use client";

import Link from "next/link";
import { UserNav } from "@/components/UserNav";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6h16M4 12h12M4 18h8" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Distiller</p>
            <p className="text-xs text-muted-foreground">News Intelligence</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </nav>
    </header>
  );
}