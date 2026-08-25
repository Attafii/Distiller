"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, CheckIcon, GlobeIcon } from "@/components/icons";
import { Globe, type GlobeMarker } from "@/components/globe";
import {
  REGION_BLURB,
  REGION_COORDS,
  REGION_GROUPS,
  REGION_RGB,
  TOPIC_META,
  TOPICS,
  topicColor,
} from "@/lib/constants";

/* ═══════════════════════════════════════════════════════════
   THE FRACTION PICKER
   Distillation separates a mixture into fractions. Pick the
   ones you want and the still is tuned to them alone.
   ═══════════════════════════════════════════════════════════ */

export function TopicPicker({ totalBriefs }: { totalBriefs: number }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [n, setN] = useState<number>(totalBriefs);
  const [loading, setLoading] = useState(false);

  const focused = hover ?? region;

  const globeMarkers = useMemo<GlobeMarker[]>(() => {
    const all = REGION_GROUPS.flatMap((g) => g.regions).filter(
      (r) => r !== "World"
    );
    return all.map((r) => ({
      id: r,
      location: REGION_COORDS[r],
      size: focused === r ? 0.1 : 0.03,
      color: REGION_RGB[r],
    }));
  }, [focused]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (region) params.set("region", region);

    setLoading(true);
    fetch(`/api/count?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setN(typeof d.count === "number" ? d.count : 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topic, region]);

  const href = (() => {
    const p = new URLSearchParams();
    if (topic) p.set("topic", topic);
    if (region) p.set("region", region);
    const qs = p.toString();
    return `/feed${qs ? `?${qs}` : ""}`;
  })();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* ── live readout · clean, no top strip ── */}
      <div className="border-b border-line bg-paper px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className={`font-display text-4xl font-semibold tabular-nums leading-none transition-all duration-300 sm:text-5xl ${
                loading ? "opacity-40" : "opacity-100"
              }`}
              style={{ color: topic ? topicColor(topic) : "var(--color-ink)" }}
            >
              {n}
            </span>
            <span className="t-mono text-faint">brief{n === 1 ? "" : "s"} match</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {topic || region ? (
              <>
                {topic && (
                  <button
                    type="button"
                    onClick={() => setTopic(null)}
                    className="pop-in inline-flex items-center gap-1 rounded-full px-2.5 py-1 t-micro transition hover:opacity-70"
                    style={{
                      background: `color-mix(in oklab, ${topicColor(topic)} 15%, transparent)`,
                      color: topicColor(topic),
                    }}
                  >
                    {topic} <span aria-hidden>×</span>
                  </button>
                )}
                {region && (
                  <button
                    type="button"
                    onClick={() => setRegion(null)}
                    className="pop-in inline-flex items-center gap-1 rounded-full bg-teal/12 px-2.5 py-1 t-micro text-teal transition hover:opacity-70"
                  >
                    {region} <span aria-hidden>×</span>
                  </button>
                )}
              </>
            ) : (
              <span className="t-mono text-faint">everything, unfiltered</span>
            )}
          </div>
        </div>
      </div>

      {/* ── topics ── */}
      <div className="border-b border-line p-5 sm:p-7">
        <p className="t-micro text-faint">choose a fraction</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TOPICS.map((t) => {
            const on = topic === t;
            const c = topicColor(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(on ? null : t)}
                className="group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300"
                style={{
                  borderColor: on ? c : "var(--color-line)",
                  background: on
                    ? `color-mix(in oklab, ${c} 9%, transparent)`
                    : "var(--color-paper)",
                  transform: on ? "translateY(-2px)" : undefined,
                  boxShadow: on ? "var(--shadow-lift)" : undefined,
                }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-[3px] origin-left transition-transform duration-400"
                  style={{
                    background: c,
                    transform: on ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rotate-45 transition-transform duration-300 group-hover:scale-125"
                    style={{ background: c }}
                  />
                  <span
                    className="truncate text-[13.5px] font-semibold transition-colors"
                    style={{ color: on ? c : "var(--color-ink)" }}
                  >
                    {t}
                  </span>
                  {on && (
                    <CheckIcon
                      width={11}
                      height={11}
                      className="pop-in ml-auto shrink-0"
                      style={{ color: c }}
                    />
                  )}
                </span>
                <span className="mt-1 block truncate text-[11px] text-faint">
                  {TOPIC_META[t]?.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── regions · globe center stage ── */}
      <div className="p-5 sm:p-7">
        <div className="text-center sm:text-left">
          <p className="t-micro flex items-center justify-center gap-1.5 text-faint sm:justify-start">
            <GlobeIcon width={11} height={11} /> and a region
          </p>
          <p className="t-body mx-auto mt-2 max-w-md text-muted sm:mx-0">
            A brief can be global, continental, or country-specific.
          </p>
        </div>

        {/* THE GLOBE — center stage, no side clutter */}
        <div className="relative mt-6 sm:mt-8">
          <div className="pointer-events-none absolute inset-0 -m-6 rounded-full bg-teal/[0.04] blur-3xl" />

          <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem]">
            <Globe focus={focused ? REGION_COORDS[focused] : null} markers={globeMarkers} />
          </div>

          {/* focused-region label, dead centre under the globe */}
          <div className="mx-auto mt-4 max-w-sm text-center">
            <p
              className="t-mono transition-colors duration-300"
              style={{
                color: focused
                  ? `rgb(${REGION_RGB[focused].map((v) => Math.round(v * 255)).join(",")})`
                  : "var(--color-faint)",
              }}
            >
              {focused ?? "drag to spin"}
            </p>
            <p className="mt-1.5 min-h-[2.5rem] text-[13px] leading-snug text-muted">
              {focused ? REGION_BLURB[focused] : "Every desk we cover, on one sphere."}
            </p>
          </div>
        </div>

        {/* region desks · below the globe on all screens */}
        <div className="mt-8 space-y-2.5">
          {REGION_GROUPS.map((g) => (
            <div
              key={g.label}
              className="rounded-xl border border-line bg-paper p-3.5"
            >
              <div className="flex items-baseline justify-between">
                <span className="t-mono text-faint">{g.label}</span>
                <span className="t-mono text-faint">
                  {g.regions.length} desk{g.regions.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {g.regions.map((r) => {
                  const on = region === r;
                  const rgb = REGION_RGB[r];
                  const c = `rgb(${rgb.map((v) => Math.round(v * 255)).join(",")})`;
                  return (
                    <button
                      key={r}
                      type="button"
                      onMouseEnter={() => setHover(r)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(r)}
                      onBlur={() => setHover(null)}
                      onClick={() => setRegion(on ? null : r)}
                      className="group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-all duration-300"
                      style={
                        on
                          ? {
                              borderColor: c,
                              background: c,
                              color: "var(--color-paper)",
                              boxShadow: "var(--shadow-lift)",
                            }
                          : {
                              borderColor: "var(--color-line)",
                              background: "var(--color-surface)",
                              color: "var(--color-muted)",
                            }
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-150"
                        style={{ background: on ? "var(--color-paper)" : c }}
                      />
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* action */}
        <div className="mt-7 flex flex-col items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <Link
            href={href}
            className="sheen group inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-ember sm:justify-start"
          >
            View {n} brief{n === 1 ? "" : "s"}
            <ArrowRightIcon
              width={14}
              height={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          {(topic || region) && (
            <button
              type="button"
              onClick={() => {
                setTopic(null);
                setRegion(null);
              }}
              className="t-mono text-faint transition-colors hover:text-ink sm:ml-1"
            >
              reset
            </button>
          )}
          <p className="hidden t-mono text-faint sm:ml-auto sm:block">
            free covers 2 · pro covers all
          </p>
        </div>
      </div>
    </div>
  );
}
