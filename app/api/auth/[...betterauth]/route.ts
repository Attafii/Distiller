import { auth } from "@/lib/auth";

const handler = auth.handler as (request: Request) => Promise<Response>;

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export const dynamic = "force-dynamic";