import { NextRequest, NextResponse } from "next/server";
import { recordReading } from "@/lib/streak";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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