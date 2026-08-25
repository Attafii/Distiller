"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BoltIcon, FlaskIcon, LockIcon, MenuIcon, XIcon } from "@/components/icons";
import { Ticker } from "@/components/motion";
import { ThemeToggle } from "@/components/theme-toggle";

export type NavUser = {
  email: string;
  name: string | null;
  plan: "free" | "pro";
} | null;

export type Headline = {
  topic: string;
  title: string;
  href: string;
  color: string;
};

export function Nav({
  user,
  headlines = [],
}: {
  user: NavUser;
  headlines?: Headline[];
}) {
  const pathname = usePathname();
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
  }, [pathname]);

  // lock body scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { href: "/feed", label: "Browse" },
    { href: "/ask", label: "Ask" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="sticky top-0 z-50">
      {headlines.length > 0 && <Ticker items={headlines} />}

      <header
        className={`border-b transition-colors duration-300 ${
          scrolled
            ? "border-line bg-paper/90 backdrop-blur-md"
            : "border-transparent bg-paper/60 backdrop-blur-sm"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-8 lg:gap-9">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper transition-colors duration-300 group-hover:bg-ember">
                <FlaskIcon width={16} height={16} />
              </span>
              <span className="font-display text-[18px] font-semibold tracking-tight text-ink">
                Distiller
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {l.label}
                    <span
                      className={`absolute inset-x-3 -bottom-0.5 h-px origin-center bg-ember transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenu((o) => !o)}
                  className="flex items-center gap-2 rounded-md border border-line bg-surface py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-ember/50 sm:pr-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-ink text-paper">
                    <UserGlyph />
                  </span>
                  <span className="hidden max-w-[7rem] truncate sm:block">
                    {user.name ?? user.email.split("@")[0]}
                  </span>
                  {user.plan === "pro" && (
                    <span className="flex items-center gap-0.5 rounded-[4px] bg-brass-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brass">
                      <BoltIcon width={8} height={8} /> pro
                    </span>
                  )}
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-deep)]">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.name ?? "Account"}
                      </p>
                      <p className="t-mono truncate text-faint">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/bookmarks"
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2"
                      >
                        Bookmarks
                        {user.plan !== "pro" && (
                          <LockIcon width={13} height={13} className="text-faint" />
                        )}
                      </Link>
                      <Link
                        href="/pricing"
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2"
                      >
                        {user.plan === "pro" ? "Manage plan" : "Upgrade to Pro"}
                      </Link>
                      <form action="/api/auth/signout" method="post">
                        <button
                          type="submit"
                          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-ember transition-colors hover:bg-ember-soft"
                        >
                          Sign out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2.5 sm:flex">
                <Link
                  href="/signin"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="sheen rounded-md bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-ember"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* mobile trigger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-2 md:hidden"
            >
              {mobileOpen ? <XIcon width={18} height={18} /> : <MenuIcon width={18} height={18} />}
            </button>
          </div>
        </nav>

        {/* mobile sheet */}
        {mobileOpen && (
          <div className="reveal-in border-t border-line bg-paper md:hidden">
            <div className="space-y-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-md px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/bookmarks"
                  className="block rounded-md px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  Bookmarks
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-3">
                {user ? (
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-line py-2.5 text-sm font-semibold text-ember"
                    >
                      Sign out
                    </button>
                  </form>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="block rounded-lg bg-ink py-2.5 text-center text-sm font-semibold text-paper"
                    >
                      Get started free
                    </Link>
                    <Link
                      href="/signin"
                      className="block rounded-lg border border-line py-2.5 text-center text-sm font-semibold text-ink"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

function UserGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1.5-3.5 4.3-5 7.5-5s6 1.5 7.5 5" />
    </svg>
  );
}
