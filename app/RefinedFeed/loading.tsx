export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-16 animate-pulse rounded-full border border-zinc-800 bg-zinc-900/70" />
        <div className="mb-8 grid gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-soft lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-12 w-4/5 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-zinc-800" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-zinc-800" />
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6">
            <div className="mb-4 h-4 w-24 animate-pulse rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-zinc-800" />
            </div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
              <div className="mb-4 h-4 w-28 rounded-full bg-zinc-800" />
              <div className="mb-3 h-6 w-4/5 rounded-full bg-zinc-800" />
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-zinc-800/80" />
                <div className="h-16 rounded-2xl bg-zinc-800/80" />
                <div className="h-16 rounded-2xl bg-zinc-800/80" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
