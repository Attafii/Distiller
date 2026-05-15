import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 200;

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3) + "...";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawTitle = searchParams.get("title") ?? "Distiller — AI News Intelligence";
  const rawDescription = searchParams.get("description") ?? "Get concise 3-bullet AI summaries of top stories, grounded with RAG and embeddings.";

  const title = truncate(rawTitle.replace(/[<>]/g, ""), MAX_TITLE_LENGTH);
  const description = truncate(rawDescription.replace(/[<>]/g, ""), MAX_DESCRIPTION_LENGTH);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#09090b",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px" }} fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6h16M4 12h12M4 18h8" />
            </svg>
          </div>
          <span style={{ fontSize: "28px", fontWeight: 600, color: "#ffffff" }}>Distiller</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "800px"
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              margin: 0,
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
              fontSize: "24px",
              color: "#a1a1aa",
              lineHeight: 1.4,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "40px"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "18px",
              color: "#a1a1aa"
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#22c55e"
              }}
            />
            Powered by NVIDIA Build + RAG
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    }
  );
}