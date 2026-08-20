import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";
import { AlertCreator } from "@/components/dashboard/AlertCreator";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Your keyword alerts"
};

export default async function AlertsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const db = getDb();

  const userAlerts = await db.query.alerts.findMany({
    where: eq(alerts.userId, userId),
    orderBy: [desc(alerts.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">Get notified when keywords appear in the news.</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <AlertCreator />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {userAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-base font-medium">No alerts set up yet</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Create keyword alerts to get notified when specific topics appear in the feed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{alert.keyword}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.frequency ?? "daily"} · {alert.active ? "Active" : "Paused"}
                    </p>
                  </div>
                  <DeleteAlertButton alertId={alert.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteAlertButton({ alertId }: { alertId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return;

        const db = getDb();
        await db.delete(alerts).where(
          and(eq(alerts.userId, session.user.id), eq(alerts.id, alertId))
        );
      }}
    >
      <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete alert</span>
      </Button>
    </form>
  );
}
