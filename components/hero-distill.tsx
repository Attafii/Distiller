"use client";

import { ArrowRightIcon, BoltIcon } from "@/components/icons";

/* ═══════════════════════════════════════════════════════════
   THE DISTILLATION
   Left: the raw pile — dozens of real documents, drifting,
   overlapping, unreadable. Right: the one brief that survives.
   Between them, pulses of light carrying the signal across.
   ═══════════════════════════════════════════════════════════ */

type Doc = { lines: number[]; tilt: number; o: number; dur: number; del: number };

// Deterministic — identical on server and client.
const DOCS: Doc[] = [
  { lines: [90, 70, 82, 55], tilt: -3, o: 0.34, dur: 5.2, del: 0 },
  { lines: [78, 88, 60, 72], tilt: 2, o: 0.5, dur: 6.1, del: 0.4 },
  { lines: [85, 62, 90, 48], tilt: -1.5, o: 0.28, dur: 5.6, del: 0.9 },
  { lines: [70, 84, 76, 66], tilt: 3, o: 0.44, dur: 6.6, del: 0.2 },
  { lines: [92, 58, 80, 70], tilt: -2.5, o: 0.3, dur: 5.9, del: 1.2 },
  { lines: [66, 90, 72, 84], tilt: 1.5, o: 0.46, dur: 6.3, del: 0.7 },
  { lines: [88, 74, 64, 90], tilt: -3.5, o: 0.26, dur: 5.4, del: 1.5 },
  { lines: [74, 66, 88, 58], tilt: 2.5, o: 0.4, dur: 6.8, del: 0.3 },
  { lines: [82, 92, 68, 76], tilt: -1, o: 0.32, dur: 5.7, del: 1.1 },
];

function RawDoc({ doc }: { doc: Doc }) {
  return (
    <div
      className="doc-drift rounded-[3px] border border-line bg-surface p-1.5 shadow-sm sm:rounded-[4px] sm:p-2"
      style={
        {
          "--tilt": `${doc.tilt}deg`,
          "--o": doc.o,
          "--dur": `${doc.dur}s`,
          "--del": `${doc.del}s`,
        } as React.CSSProperties
      }
    >
      <div className="space-y-[3px] sm:space-y-1">
        {doc.lines.map((w, i) => (
          <div
            key={i}
            className="h-[2px] rounded-full bg-faint sm:h-[2.5px]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroDistill({
  topic,
  bullets,
  source,
  insight,
  articleId,
  intake,
}: {
  topic: string;
  bullets: string[];
  source: string;
  insight: string;
  articleId: number;
  intake: number;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1.05fr] lg:gap-4">
      {/* ── the raw pile ── */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 rounded-2xl bg-faint/[0.04] blur-2xl" />
        <div className="relative grid grid-cols-3 gap-2 sm:gap-2.5">
          {DOCS.map((d, i) => (
            <RawDoc key={i} doc={d} />
          ))}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <p className="t-mono text-faint">raw intake</p>
          <p className="t-mono text-muted">
            <span className="text-ink">{intake}</span> articles / day
          </p>
        </div>
      </div>

      {/* ── the transfer (Data Comet / Arrow) ── */}
      <div className="relative flex items-center justify-center lg:h-40 lg:w-20">
        {/* horizontal on desktop */}
        <div className="relative hidden h-[2px] w-full overflow-hidden rounded-full bg-gradient-to-r from-transparent via-line to-transparent lg:block">
          <span className="comet-beam-x" style={{ animationDelay: "0s" }} />
          <span className="comet-beam-x" style={{ animationDelay: "1s" }} />
        </div>

        {/* vertical on mobile */}
        <div className="relative h-16 w-[2px] overflow-hidden rounded-full bg-gradient-to-b from-transparent via-line to-transparent lg:hidden">
          <span className="comet-beam-y" style={{ animationDelay: "0s" }} />
          <span className="comet-beam-y" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* ── the brief that survives ── */}
      <div className="relative">
        <div className="glow-breathe pointer-events-none absolute -inset-4 rounded-2xl bg-gradient-to-br from-ember/[0.1] via-amber/[0.06] to-teal/[0.08] blur-2xl" />
        <article className="animated-border active relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-deep)] sm:p-6">

          <div className="flex items-center gap-2">
            <span
              className="rounded-[4px] px-2 py-0.5 t-micro"
              style={{
                background: "color-mix(in oklab, var(--color-ember) 14%, transparent)",
                color: "var(--color-ember)",
              }}
            >
              {topic}
            </span>
            <span className="t-mono text-faint">distilled</span>
            <span className="ml-auto flex items-center gap-1 t-mono text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal pulse" />
              verified
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {bullets.slice(0, 3).map((b, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-[8px] h-1.5 w-1.5 shrink-0 rotate-45"
                  style={{
                    background: [
                      "var(--color-ember)",
                      "var(--color-amber)",
                      "var(--color-teal)",
                    ][i],
                  }}
                />
                <span className="text-[13.5px] leading-relaxed text-ink-2">{b}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-5 border-l-2 px-3.5 py-2.5"
            style={{
              borderColor: "var(--color-ember)",
              background: "color-mix(in oklab, var(--color-ember) 7%, transparent)",
            }}
          >
            <p className="t-micro flex items-center gap-1.5 text-ember">
              <BoltIcon width={9} height={9} /> key insight
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{insight}</p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
            <p className="t-mono text-faint">
              source · <span className="text-ink">{source}</span>
            </p>
            <a
              href={`/article/${articleId}`}
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember"
            >
              <span className="underline-draw">Read</span>
              <ArrowRightIcon
                width={12}
                height={12}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
