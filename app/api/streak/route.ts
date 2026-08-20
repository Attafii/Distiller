import { NextRequest, NextResponse } from "next/server";
import { recordReading } from "@/lib/streak";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await recordReading(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to record reading" }, { status: 500 });
  }
}