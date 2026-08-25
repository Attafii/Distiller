export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-10 w-32 animate-pulse rounded-full bg-card/90" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-muted-2" />
              <div className="h-6 w-4/5 animate-pulse rounded-full bg-muted-2" />
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-muted-2/80" />
                <div className="h-16 animate-pulse rounded-2xl bg-muted-2/80" />
                <div className="h-16 animate-pulse rounded-2xl bg-muted-2/80" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}