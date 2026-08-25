"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";

/* ═══════════════════════════════════════════════════════════
   THE CUT
   A distiller's real skill isn't making spirit — it's deciding
   what to throw away. The heads are volatile junk, the tails
   are heavy filler. Only the heart is kept.
   ═══════════════════════════════════════════════════════════ */

type Fraction = "heads" | "hearts" | "tails";

const HEADS = [
  "“BREAKING: this changes everything”",
  "“Sources say…” — unnamed, unverifiable, repeated 40×",
  "Twenty-two tweets of speculation before the facts landed",
  "The hot take you'll have forgotten by Thursday",
];

const TAILS = [
  "Paragraph three: the company's founding history, again",
  "“Reached for comment, the company did not respond.”",
  "Six paragraphs explaining what a language model is",
  "The ad slot, the newsletter plug, the related-links rail",
];

const META: Record<
  Fraction,
  { label: string; verdict: string; note: string; yield: string }
> = {
  heads: {
    label: "Heads",
    verdict: "Discarded",
    note: "The volatile fraction that boils off first — unstable, loud, and worth nothing.",
    yield: "~15%",
  },
  hearts: {
    label: "Heart",
    verdict: "Kept",
    note: "The only fraction that survives. Everything you actually needed.",
    yield: "~5%",
  },
  tails: {
    label: "Tails",
    verdict: "Discarded",
    note: "The heavy residue that never vapourises — filler, boilerplate, repetition.",
    yield: "~80%",
  },
};

export function TheCut({
  bullets,
  keyInsight,
  source,
  articleId,
}: {
  bullets: string[];
  keyInsight: string;
  source: string;
  articleId: number;
}) {
  const [cut, setCut] = useState<Fraction>("hearts");
  const meta = META[cut];

  const kept = cut === "hearts";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* segmented control */}
      <div
        className="grid grid-cols-3 border-b border-line"
        role="tablist"
        aria-label="Distillation fractions"
      >
        {(["heads", "hearts", "tails"] as Fraction[]).map((f) => {
          const on = cut === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setCut(f)}
              className={`group relative py-3.5 text-center transition-colors duration-300 ${
                on ? "text-ember" : "text-faint hover:text-muted"
              }`}
            >
              <span className="t-mono block">{META[f].label}</span>
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 origin-center bg-ember transition-transform duration-400 ${
                  on ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* fraction body */}
      <div key={cut} className="reveal-in p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="t-mono text-ember">{meta.verdict}</p>
          <p className="t-mono text-faint">
            of the article · <span className="text-ink">{meta.yield}</span>
          </p>
        </div>

        <p className="t-body mt-3 max-w-xl text-muted">{meta.note}</p>

        <div className="mt-6 border-t border-line pt-6">
          {kept ? (
            <ul className="space-y-3.5">
              {(bullets ?? []).map((b, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="mt-[9px] h-2 w-2 shrink-0 rotate-45 bg-ember" />
                  <span className="t-body text-ink">{b}</span>
                </li>
              ))}
              <li className="flex gap-3.5 border-t border-line pt-4">
                <span className="mt-[9px] h-2 w-2 shrink-0 rotate-45 bg-ember/40" />
                <span className="t-body text-ink-2">
                  <span className="t-mono mr-2 text-ember">insight</span>
                  {keyInsight}
                </span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-3">
              {(cut === "heads" ? HEADS : TAILS).map((t, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-faint/60" />
                  <span className="t-body text-faint line-through decoration-line">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
          <p className="t-mono text-faint">
            source · <span className="text-ink">{source}</span>
          </p>
          {kept && (
            <Link
              href={`/article/${articleId}`}
              className="group ml-auto inline-flex items-center gap-2 text-sm font-semibold text-ember"
            >
              <span className="underline-draw">Read the full brief</span>
              <ArrowRightIcon
                width={13}
                height={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   YIELD
   The number that makes distillation honest: how much of the
   original actually survives the cut.
   ═══════════════════════════════════════════════════════════ */

export function YieldBar({ pct }: { pct: number }) {
  return (
    <div className="w-full">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-ember"
          style={{ width: `${pct}%`, animation: "fill 1.4s cubic-bezier(.16,1,.3,1) both" }}
        />
      </div>
    </div>
  );
}
