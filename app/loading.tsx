export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-28 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-8">
              <div className="h-6 w-40 rounded-full bg-muted animate-pulse" />
              <div className="space-y-4">
                <div className="h-16 w-full rounded-xl bg-muted animate-pulse" />
                <div className="h-16 w-4/5 rounded-xl bg-muted animate-pulse" />
              </div>
              <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
              <div className="flex gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-12 rounded bg-muted animate-pulse" />
                    <div className="mt-2 h-3 w-16 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="h-4 w-full rounded bg-muted animate-pulse mb-2" />
                  <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}