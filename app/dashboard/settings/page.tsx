import type { Metadata } from "next";
import { User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings"
};

export default function SettingsPage() {
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
          <CardDescription className="text-sm">Update your name and email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <Button size="sm">Save changes</Button>
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
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary">
                  <div className="h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          ))}
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
          <Button variant="outline" size="sm">Change password</Button>
          <p className="text-xs text-muted-foreground">
            For security, you will be asked to verify your email after any change.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}