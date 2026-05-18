import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings"
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription className="text-sm">Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <p className="mt-1 text-sm text-muted-foreground">{user.name ?? "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="mt-1 text-sm text-muted-foreground">{user.email ?? "Not set"}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile changes can be made through your authentication provider.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription className="text-sm">Manage alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Daily digest email", description: "Receive a daily summary of top stories" },
            { label: "Breaking news alerts", description: "Get notified for breaking news in your topics" },
            { label: "Weekly summary", description: "A weekly recap of your reading activity" }
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" disabled />
                <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary">
                  <div className="h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Notification preferences will be configurable once email integration is active.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Shield className="h-4 w-4" />
            Privacy & Security
          </CardTitle>
          <CardDescription className="text-sm">Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm" disabled>
            Change password
          </Button>
          <p className="text-xs text-muted-foreground">
            Password changes can be made through your authentication provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
