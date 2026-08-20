import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image
    });
  } catch (error) {
    // Distinguish between auth failure and server error
    const message = error instanceof Error ? error.message : String(error);
    const isDbError = message.includes("database") || message.includes("connection") || message.includes("ECONNREFUSED");

    console.error("[get-user] Error:", message);

    return NextResponse.json(
      { error: isDbError ? "Service temporarily unavailable" : "Failed to get user" },
      { status: isDbError ? 503 : 500 }
    );
  }
}

export const dynamic = "force-dynamic";