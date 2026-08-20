import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail, buildPasswordResetEmail, buildVerificationEmail } from "@/lib/email";

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
      return siteUrl.replace(/\/+$/, "");
    }
  })();

  const authOptions: Parameters<typeof betterAuth>[0] = {
    baseURL: normalizedSiteOrigin,
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
        try {
          const email = buildPasswordResetEmail(url);
          await sendEmail({ to: user.email, subject: email.subject, html: email.html });
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
    rateLimit: {
      window: 60,
      max: 100
    },
    advanced: {
      cookies: {
        state: {
          attributes: {
            sameSite: "lax",
            secure: true,
            path: "/"
          }
        },
        session_token: {
          attributes: {
            sameSite: "lax",
            secure: true,
            path: "/"
          }
        }
      }
    },
    secret: process.env.BETTER_AUTH_SECRET
  };

  return betterAuth(authOptions);
}

export const auth = createAuth();
export const handler = auth.handler;