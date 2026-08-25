"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BoltIcon, CheckIcon, ShieldIcon } from "@/components/icons";

/* ── Reveal on scroll ───────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "ul";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${shown ? "reveal-in" : "reveal"} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ── Count up ───────────────────────────────────────────────── */

export function CountUp({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  );
}

/* ── Live headline ticker ───────────────────────────────────── */

export function Ticker({
  items,
}: {
  items: { topic: string; title: string; href: string; color: string }[];
}) {
  const row = [...items, ...items];
  return (
    <div className="marquee-host relative overflow-hidden bg-ink text-paper">
      {/* the moving spectrum rule — the whole palette, always in motion */}
      <span className="gradient-rule absolute inset-x-0 top-0 z-20 h-[2px]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink to-transparent sm:w-20" />

      <div className="marquee-track flex w-max items-stretch py-0">
        {row.map((item, i) => (
          <Link
            key={`${item.title}-${i}`}
            href={item.href}
            className="group flex shrink-0 items-center gap-2.5 border-r border-paper/10 px-5 py-2 transition-colors hover:bg-paper/[0.04]"
          >
            <span
              className="h-3 w-[3px] shrink-0 rounded-full transition-all duration-300 group-hover:h-4"
              style={{ background: item.color }}
            />
            <span
              className="t-micro shrink-0 transition-opacity"
              style={{ color: item.color }}
            >
              {item.topic}
            </span>
            <span className="t-mono max-w-[12rem] truncate text-paper/55 transition-colors group-hover:text-paper/90 sm:max-w-[20rem]">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Live ask demo ──────────────────────────────────────────── */

type DemoResult = {
  answer: string;
  bullets: string[];
  keyInsight: string;
  topicIntent: string | null;
  sources: { articleId: number; title: string; source: string; score: number }[];
};

const PIPELINE = [
  "Fetch coverage",
  "Chunk ~900 chars",
  "Embed query",
  "Rank by cosine",
  "Ground bullets",
];

export function LiveAskDemo({
  suggestions,
}: {
  suggestions: { q: string; label: string }[];
}) {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [step, setStep] = useState(-1);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(suggestions[0]?.q ?? "");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clear, []);

  const type = useCallback((text: string) => {
    let i = 0;
    const speed = Math.max(8, Math.min(20, 850 / text.length));
    const tick = () => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i < text.length) timers.current.push(setTimeout(tick, speed));
    };
    tick();
  }, []);

  const run = useCallback(
    async (q: string) => {
      if (loading) return;
      setActive(q);
      setError(null);
      setResult(null);
      setTyped("");
      setLoading(true);
      setStep(0);

      PIPELINE.forEach((_, i) => {
        if (i === 0) return;
        timers.current.push(setTimeout(() => setStep(i), i * 240));
      });

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Request failed");
        timers.current.push(
          setTimeout(
            () => {
              setStep(PIPELINE.length);
              setResult(data);
              setLoading(false);
              type(data.answer ?? "");
            },
            PIPELINE.length * 240 + 140
          )
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setLoading(false);
        setStep(-1);
      }
    },
    [loading, type]
  );

  useEffect(() => {
    timers.current.push(setTimeout(() => run(suggestions[0]?.q ?? ""), 650));
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-deep)]">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-3.5 py-2 sm:px-4">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          <span className="h-2 w-2 rounded-full bg-brass/70" />
          <span className="h-2 w-2 rounded-full bg-teal/70" />
        </div>
        <p className="t-micro text-faint">live retrieval</p>
        <span className="ml-auto flex items-center gap-1.5 t-mono text-teal">
          <span className={`h-1.5 w-1.5 rounded-full bg-teal ${loading ? "pulse" : ""}`} />
          {loading ? "RUNNING" : "READY"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {suggestions.map((s) => (
            <button
              key={s.q}
              type="button"
              onClick={() => run(s.q)}
              className={`shrink-0 rounded-full border px-3 py-1 t-mono transition ${
                active === s.q
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-line text-muted hover:border-ember/50 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* pipeline — compact, hides gracefully on the smallest screens */}
        <div className="mt-4 hidden gap-x-4 gap-y-1.5 sm:grid sm:grid-cols-2">
          {PIPELINE.map((label, i) => {
            const state = step < 0 ? "idle" : i < step ? "done" : i === step ? "on" : "idle";
            return (
              <div
                key={label}
                className={`flex items-center gap-2 t-mono transition-opacity duration-300 ${
                  state === "idle" ? "text-faint/40" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                    state === "done"
                      ? "border-teal bg-teal text-surface"
                      : state === "on"
                        ? "border-ember text-ember"
                        : "border-line"
                  }`}
                >
                  {state === "done" ? (
                    <CheckIcon width={9} height={9} />
                  ) : state === "on" ? (
                    <span className="h-1 w-1 rounded-full bg-ember pulse" />
                  ) : null}
                </span>
                <span className={state === "on" ? "text-ink" : ""}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 min-h-[13rem] border-t border-line pt-4 sm:min-h-[15rem]">
          {error ? (
            <p className="t-mono text-ember">{error}</p>
          ) : !result ? (
            <p className="t-mono text-faint">
              {loading ? "distilling…" : "awaiting question…"}
            </p>
          ) : (
            <div className="reveal-in space-y-3.5">
              {result.topicIntent && (
                <p className="t-micro text-ember">topic · {result.topicIntent}</p>
              )}
              <p className="t-body text-ink-2">
                {typed}
                {typed.length < result.answer.length && (
                  <span className="caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-ember" />
                )}
              </p>

              {typed.length >= result.answer.length && (
                <div className="reveal-in space-y-3.5">
                  <ul className="space-y-2">
                    {result.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-ember" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="border-l-2 border-ember bg-ember-soft/40 px-3.5 py-2.5">
                    <p className="t-micro flex items-center gap-1.5 text-ember">
                      <BoltIcon width={9} height={9} /> insight
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
                      {result.keyInsight}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {result.sources.slice(0, 2).map((s, i) => (
                      <Link
                        key={i}
                        href={`/article/${s.articleId}`}
                        className="lift rounded-md border border-line bg-surface-2/50 p-2.5"
                      >
                        <p className="truncate text-[12.5px] font-semibold text-ink">
                          {s.title}
                        </p>
                        <p className="mt-1 flex items-center justify-between t-mono text-faint">
                          {s.source}
                          <span className="text-teal">{(s.score * 100).toFixed(0)}%</span>
                        </p>
                      </Link>
                    ))}
                  </div>

                  <p className="t-micro flex items-center gap-1.5 text-faint">
                    <ShieldIcon width={9} height={9} /> traced to source
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
