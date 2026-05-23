"use client";

import Link from "next/link";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-soft">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl">Reset password</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-10" required />
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </div>
  );
}