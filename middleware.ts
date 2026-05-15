import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
};

const API_PATHS = ["/api/feed", "/api/news/chat", "/api/debug/runtime", "/api/og"];
const BLOCKED_PATTERNS = [
  /\.(git|env|log|config|secret|key|crt|pem)$/i,
  /(^|\/)\.\./,
  /node_modules/,
  /\.next\//
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    response.headers.set("X-Powered-By", "Distiller");
    return response;
  }

  if (pathname === "/" || pathname.startsWith("/RefinedFeed") || pathname.startsWith("/refined-feed")) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|fonts|images|icons|manifest).*)"
  ]
};