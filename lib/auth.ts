import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const authSchema = {
  user: schema.users,
  session: schema.sessions,
  account: schema.accounts,
  verification: schema.verifications
};

function createAuth() {
  const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";
  const normalizedSiteOrigin = (() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return siteUrl;
    }
  })();

  const authOptions: Parameters<typeof betterAuth>[0] = {
    baseURL: siteUrl,
    trustedOrigins: (request) => {
      const trusted = new Set<string>([normalizedSiteOrigin]);

      if (request) {
        try {
          trusted.add(new URL(request.url).origin);
        } catch {
          // Ignore malformed request URLs and fall back to the configured origin.
        }
      }

      return [...trusted];
    },
    database: db
      ? drizzleAdapter(db, { provider: "pg", schema: authSchema })
      : (() => {
          throw new Error("DATABASE_URL is not set — auth requires a database connection");
        })(),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        if (!process.env.RESEND_API_KEY) {
          console.warn("[Auth] RESEND_API_KEY not set — password reset email not sent");
          console.log("[Auth] Reset URL (dev):", url);
          return;
        }

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Distiller <onboarding@resend.dev>",
              to: user.email,
              subject: "Reset your Distiller password",
              html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error("[Auth] Resend API error:", response.status, errorBody);
            console.log("[Auth] Reset URL (fallback):", url);
          }
        } catch (error) {
          console.error("[Auth] Failed to send reset email:", error);
          console.log("[Auth] Reset URL (fallback):", url);
        }
      }
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirectURI: `${normalizedSiteOrigin}/api/auth/callback/google`
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        redirectURI: `${normalizedSiteOrigin}/api/auth/callback/github`
      }
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60
      }
    },
    secret: process.env.BETTER_AUTH_SECRET
  };

  return betterAuth(authOptions);
}

export const auth = createAuth();
export const handler = auth.handler;