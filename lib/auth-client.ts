import { createAuthClient } from "better-auth/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";
const clientBaseURL = typeof window !== "undefined" ? window.location.origin : siteUrl;

export const authClient = createAuthClient({
  baseURL: clientBaseURL,
  plugin: []
});