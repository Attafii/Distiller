import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
};

const BLOCKED_PATTERNS = [
  /\.(git|env|log|config|secret|key|crt|pem)$/i,
  /(^|\/)\.\./,
  /node_modules/,
  /\.next\//
];

const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block sensitive file patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Auth protection for dashboard and onboarding
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    // Better Auth cookie names: in production (HTTPS) it prefixes with __Secure-
    const sessionCookie =
      request.cookies.get("__Secure-better-auth.session_token") ??
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session-token") ??
      request.cookies.get("better-auth.session-token");

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|fonts|images|icons|manifest).*)"
  ]
};