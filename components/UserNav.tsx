"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/get-user", {
          credentials: "include"
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex h-10 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
        <ModeToggle />
        <div className="flex items-center gap-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "User"}
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-primary text-xs font-medium text-primary-foreground">
              {user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/RefinedFeed"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Browse
      </Link>
      <Link
        href="/pricing"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Pricing
      </Link>
      <ModeToggle />
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Get started
      </Link>
    </div>
  );
}