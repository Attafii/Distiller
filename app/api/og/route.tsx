import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

import { GLOBE_LAND_PATH, GLOBE_MARKERS } from "@/lib/og/globe-dots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 200;

// Brand palette ("still identity", light paper theme).
const PAPER = "#f7f3ec";
const OCEAN = "#efe8db";
const INK = "#16150e";
const MUTED = "#6e6958";
const EMBER = "#d8451c";
const LAND = "#c9bd9f";
const MARKER_HALO = "#33d1a6";
const MARKER_CORE = "#0e7a5f";
const HAIRLINE = "rgba(22, 21, 14, 0.14)";

function loadFont(file: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "app", "api", "og", "fonts", file));
}

const fraunces = loadFont("fraunces-latin-700-normal.ttf");
const interTight = loadFont("inter-tight-latin-600-normal.ttf");
const jetbrainsMono = loadFont("jetbrains-mono-latin-500-normal.ttf");

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3) + "...";
}

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);

  if (!rateLimit.allowed) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const rawTitle = searchParams.get("title") ?? "Distiller — AI News Intelligence";
  const rawDescription =
    searchParams.get("description") ??
    "Get concise 3-bullet AI summaries of top stories, grounded with RAG and embeddings.";

  const title = truncate(rawTitle.replace(/[<>]/g, ""), MAX_TITLE_LENGTH);
  const description = truncate(rawDescription.replace(/[<>]/g, ""), MAX_DESCRIPTION_LENGTH);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: PAPER,
          fontFamily: "Inter Tight"
        }}
      >
        {/* ── Left column ────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "660px",
            padding: "64px 24px 56px 72px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontFamily: "JetBrains Mono",
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "0.32em",
              color: EMBER
            }}
          >
            DISTILLER · NEWS INTELLIGENCE
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1
              style={{
                fontSize: title.length > 60 ? 62 : 76,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.06,
                margin: 0,
                fontFamily: "Fraunces",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "25px",
                color: MUTED,
                lineHeight: 1.45,
                marginTop: "26px",
                marginBottom: 0,
                fontFamily: "Inter Tight",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {description}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: EMBER,
                transform: "rotate(45deg)"
              }}
            />
            <span
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: "20px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: MUTED
              }}
            >
              distiller.attafii.dev
            </span>
          </div>
        </div>

        {/* ── Right column: recreated cobe dot-globe ─────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width="540"
            height="540"
            style={{ display: "flex", marginRight: "-40px" }}
          >
            {/* ocean disc */}
            <circle cx="50" cy="50" r="46" fill={OCEAN} />
            {/* graticule meridians for sphere depth */}
            <ellipse cx="50" cy="50" rx="16" ry="46" fill="none" stroke="rgba(22,21,14,0.05)" strokeWidth="0.35" />
            <ellipse cx="50" cy="50" rx="33" ry="46" fill="none" stroke="rgba(22,21,14,0.05)" strokeWidth="0.35" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(22,21,14,0.05)" strokeWidth="0.35" />
            {/* land dots */}
            <path d={GLOBE_LAND_PATH} fill={LAND} />
            {/* accent markers */}
            {GLOBE_MARKERS.map((m) => (
              <g key={m.name}>
                <circle cx={m.x} cy={m.y} r="2.5" fill={MARKER_HALO} opacity="0.28" />
                <circle cx={m.x} cy={m.y} r="1.05" fill={MARKER_CORE} />
              </g>
            ))}
            {/* rim */}
            <circle cx="50" cy="50" r="46" fill="none" stroke={HAIRLINE} strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 700, style: "normal" },
        { name: "Inter Tight", data: interTight, weight: 600, style: "normal" },
        { name: "JetBrains Mono", data: jetbrainsMono, weight: 500, style: "normal" }
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    }
  );
}
