export default function Loading() {
  return (
    <main>
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-32 animate-pulse rounded-full bg-card/90" />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-soft">
            <div className="mb-5 h-4 w-28 animate-pulse rounded-full bg-muted" />
            <div className="mb-4 h-12 w-4/5 animate-pulse rounded-full bg-muted" />
            <div className="mb-3 h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="mb-3 h-4 w-11/12 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="rounded-3xl border border-border bg-card/90 p-8 shadow-soft">
            <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-muted/90" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted/90" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted/90" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
