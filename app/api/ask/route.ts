import { NextResponse } from "next/server";
import { ensureSeeded } from "@/db/seed";
import { askTheNews } from "@/lib/retrieval";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const question = (body.question ?? "").trim().slice(0, 300);
  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  await ensureSeeded();
  const result = await askTheNews(question);
  if (!result) {
    return NextResponse.json(
      { error: "The newsroom is still warming up. Try again shortly." },
      { status: 503 }
    );
  }
  return NextResponse.json({ question, ...result });
}
