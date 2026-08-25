import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function LoginSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="text-center pb-2">
        <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Sign in to your Distiller account</CardDescription>
      </div>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <div className="h-4 w-16 rounded bg-muted-2" />
          <div className="h-10 w-full rounded-lg bg-muted-2" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-20 rounded bg-muted-2" />
          <div className="h-10 w-full rounded-lg bg-muted-2" />
        </div>
        <div className="h-10 w-full rounded-lg bg-primary/20" />
      </CardContent>
    </div>
  );
}

export function SignupSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="text-center pb-2">
        <CardTitle className="font-display text-2xl">Create your account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Start with the free plan, upgrade anytime</CardDescription>
      </div>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <div className="h-4 w-20 rounded bg-muted-2" />
          <div className="h-10 w-full rounded-lg bg-muted-2" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-16 rounded bg-muted-2" />
          <div className="h-10 w-full rounded-lg bg-muted-2" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted-2" />
          <div className="h-10 w-full rounded-lg bg-muted-2" />
        </div>
        <div className="h-10 w-full rounded-lg bg-primary/20" />
      </CardContent>
    </div>
  );
}