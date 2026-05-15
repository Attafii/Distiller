import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

if (!db) {
  throw new Error("DATABASE_URL environment variable is not set. Add it to .env.local to enable authentication.");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectURI: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      redirectURI: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/github`
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
  secret: process.env.BETTER_AUTH_SECRET ?? "change-me-in-production",
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app"
});

export const handler = auth.handler;