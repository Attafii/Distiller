"use client";

import createGlobe from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";

export type GlobeMarker = {
  id: string;
  location: [number, number];
  size?: number;
  color?: [number, number, number];
};

type RGB = [number, number, number];

const THEME = {
  light: {
    dark: 0,
    diffuse: 1.15,
    mapBrightness: 7.4,
    baseColor: [0.89, 0.86, 0.79] as RGB,
    glowColor: [0.94, 0.92, 0.87] as RGB,
  },
  dark: {
    dark: 1,
    diffuse: 1.4,
    mapBrightness: 5.4,
    baseColor: [0.2, 0.21, 0.17] as RGB,
    glowColor: [0.1, 0.11, 0.08] as RGB,
  },
};

/**
 * A real WebGL globe (cobe) with true continent outlines.
 * - auto-rotates until grabbed
 * - drag to spin, with inertia
 * - eases toward `focus` when a region is selected
 * - re-themes on light/dark switch
 */
export function Globe({
  focus,
  markers = [],
  className = "",
  accent = [0.2, 0.82, 0.65],
}: {
  focus?: [number, number] | null;
  markers?: GlobeMarker[];
  className?: string;
  accent?: RGB;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(false);

  // Start centered on Africa/Europe so continents fill the lens immediately.
  const phi = useRef(-Math.PI / 2 - (20 * Math.PI) / 180);
  const theta = useRef(0.18);
  const targetPhi = useRef<number | null>(null);
  const targetTheta = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const velocity = useRef(0);
  const auto = useRef(true);

  const darkRef = useRef(false);
  const markersRef = useRef<GlobeMarker[]>(markers);
  const accentRef = useRef<RGB>(accent);
  markersRef.current = markers;
  accentRef.current = accent;

  // theme watcher
  useEffect(() => {
    const read = () => {
      const d = document.documentElement.classList.contains("dark");
      darkRef.current = d;
      setIsDark(d);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => mo.disconnect();
  }, []);

  // aim at the selected region
  useEffect(() => {
    if (!focus) {
      targetPhi.current = null;
      targetTheta.current = null;
      auto.current = true;
      return;
    }
    const [lat, lng] = focus;
    const desired = -((lng * Math.PI) / 180) - Math.PI / 2;
    const twoPi = Math.PI * 2;
    // shortest angular path from where we are now
    const delta = ((((desired - phi.current) % twoPi) + twoPi + Math.PI) % twoPi) - Math.PI;
    targetPhi.current = phi.current + delta;
    targetTheta.current = Math.max(-0.55, Math.min(0.55, (lat * Math.PI) / 180 / 1.7));
    auto.current = false;
  }, [focus]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    targetPhi.current = null;
    targetTheta.current = null;
    auto.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      phi.current += dx / 250;
      theta.current = Math.max(-0.6, Math.min(0.6, theta.current + dy / 620));
      velocity.current = Math.max(-0.06, Math.min(0.06, dx / 250));
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      window.setTimeout(() => {
        if (!drag.current && targetPhi.current === null) auto.current = true;
      }, 1800);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let disposed = false;
    let size = 0;

    const start = () => {
      if (disposed || globe) return;
      size = canvas.offsetWidth;
      if (!size) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const t = darkRef.current ? THEME.dark : THEME.light;

      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi: phi.current,
        theta: theta.current,
        mapSamples: 16000,
        opacity: 0.95,
        dark: t.dark,
        diffuse: t.diffuse,
        mapBrightness: t.mapBrightness,
        baseColor: t.baseColor,
        glowColor: t.glowColor,
        markerColor: accentRef.current,
        markers: markersRef.current.map((m) => ({
          location: m.location,
          size: m.size ?? 0.05,
          color: m.color,
        })),
      });

      const tick = () => {
        if (disposed || !globe) return;

        if (targetPhi.current !== null) {
          const d = targetPhi.current - phi.current;
          phi.current += d * 0.075;
          if (Math.abs(d) < 0.0015) targetPhi.current = null;
        } else if (auto.current && !drag.current) {
          phi.current += 0.0034;
        } else if (!drag.current && Math.abs(velocity.current) > 1e-5) {
          phi.current += velocity.current;
          velocity.current *= 0.93;
        }

        if (targetTheta.current !== null) {
          const d = targetTheta.current - theta.current;
          theta.current += d * 0.075;
          if (Math.abs(d) < 0.0015) targetTheta.current = null;
        }

        const th = darkRef.current ? THEME.dark : THEME.light;
        globe.update({
          phi: phi.current,
          theta: theta.current,
          dark: th.dark,
          diffuse: th.diffuse,
          mapBrightness: th.mapBrightness,
          baseColor: th.baseColor,
          glowColor: th.glowColor,
          markerColor: accentRef.current,
          markers: markersRef.current.map((m) => ({
            location: m.location,
            size: m.size ?? 0.05,
            color: m.color,
          })),
        });

        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      requestAnimationFrame(() => {
        if (canvas) canvas.style.opacity = "1";
      });
    };

    let ro: ResizeObserver | null = null;
    if (canvas.offsetWidth > 0) {
      start();
    } else {
      ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro?.disconnect();
          start();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      disposed = true;
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      globe?.destroy();
    };
  }, [isDark]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        aria-label="Interactive globe"
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 0.9s ease",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}
