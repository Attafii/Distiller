"use client";

import { useEffect } from "react";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
            <AlertTriangle className="h-6 w-6 text-zinc-300" />
            <h1 className="mt-4 text-xl font-semibold text-zinc-100">Something went wrong</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              The feed or distillation pipeline failed. Retry to reload the page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-300"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
