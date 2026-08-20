import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthForms";
import { LoginForm } from "@/components/auth/AuthForms";
import { LoginSkeleton } from "@/components/auth/AuthSkeleton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Sign In · Distiller",
  description: "Sign in to your Distiller account.",
  alternates: { canonical: `${siteUrl}/auth/login` }
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}