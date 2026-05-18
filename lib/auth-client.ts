import { createAuthClient } from "better-auth/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.app";

export const authClient = createAuthClient({
  baseURL: siteUrl,
  plugin: []
});