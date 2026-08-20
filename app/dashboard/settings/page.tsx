import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NotificationSettings } from "@/components/dashboard/NotificationSettings";

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
  const db = getDb();

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, user.id)
  });

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
        <CardContent>
          <NotificationSettings
            dailyEmailEnabled={prefs?.dailyEmailEnabled ?? false}
            breakingNewsEnabled={prefs?.breakingNewsEnabled ?? false}
            weeklySummaryEnabled={prefs?.weeklySummaryEnabled ?? false}
          />
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/forgot-password">
              Change password
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            You'll receive an email to reset your password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
