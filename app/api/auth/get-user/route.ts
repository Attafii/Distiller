import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      request: req as unknown as Request,
      headers: { cookie: req.headers.get("cookie") ?? "" }
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
  } catch {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";