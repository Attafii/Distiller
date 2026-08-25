import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Sign-out endpoint expected by the landing Nav (ported from the static landing).
 * Delegates to better-auth, then redirects home.
 */
export async function POST(request: Request) {
  try {
    await auth.api.signOut({
      headers: request.headers,
      asResponse: false
    });
  } catch {
    // best-effort — clear what we can and go home
  }

  return Response.redirect(new URL("/", request.url), 303);
}
