import { NextResponse } from "next/server";

import { getGitHubRepoStats } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getGitHubRepoStats();

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GitHub stats error";

    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
