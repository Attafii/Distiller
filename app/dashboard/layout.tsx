"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Loader2, BookMarked, History, Bell, Settings, CreditCard, LayoutDashboard, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: BookMarked },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/get-user", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/auth/login?callbackUrl=" + encodeURIComponent(pathname));
        }
      } catch {
        router.push("/auth/login?callbackUrl=" + encodeURIComponent(pathname));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [pathname, router]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop only */}
      <aside className="relative hidden w-64 flex-col border-r border-border bg-surface lg:flex 2xl:w-72">
        <span className="gradient-rule absolute inset-x-0 top-0 h-[2px]" />
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-ink text-paper transition-colors duration-300 group-hover:bg-ember">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3h4M11 3v6.2L5.6 18.4A2 2 0 0 0 7.3 21.5h9.4a2 2 0 0 0 1.7-3.1L13 9.2V3" />
                <path d="M8 15.5h8" opacity={0.6} />
              </svg>
            </div>
            <span className="font-display text-[17px] font-semibold tracking-tight">Distiller</span>
          </Link>
        </div>

        <p className="t-micro px-6 pb-1 pt-4 text-faint">the still</p>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted-2 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Card className="border-border bg-muted-2/40">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user?.name ?? "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
                </div>
              </div>
              <form action="/api/auth/sign-out" method="POST">
                <Button variant="outline" size="sm" type="submit" className="w-full">
                  Sign out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-ink text-paper">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3h4M11 3v6.2L5.6 18.4A2 2 0 0 0 7.3 21.5h9.4a2 2 0 0 0 1.7-3.1L13 9.2V3" />
                <path d="M8 15.5h8" opacity={0.6} />
              </svg>
            </div>
            <span className="font-display text-[17px] font-semibold tracking-tight">Distiller</span>
          </Link>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted-2"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-foreground" />
              ) : (
                <Menu className="h-4 w-4 text-foreground" />
              )}
            </button>
          </div>
        </header>

        {/* Slide-down mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 right-0 top-[57px] z-50 lg:hidden"
              >
                <div className="border-b border-border bg-card shadow-soft">
                  <nav className="px-4 py-4">
                    <div className="space-y-1">
                      {navItems.map((item, index) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted-2 hover:text-foreground"
                              }`}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {user?.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{user?.name ?? "User"}</p>
                          <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
                        </div>
                      </div>
                      <form action="/api/auth/sign-out" method="POST" className="mt-2">
                        <Button variant="outline" size="sm" type="submit" className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </form>
                    </div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}