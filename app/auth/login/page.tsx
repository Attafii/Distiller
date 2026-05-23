import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthForms";
import { LoginForm } from "@/components/auth/AuthForms";
import { LoginSkeleton } from "@/components/auth/AuthSkeleton";

export const metadata: Metadata = {
  title: "Sign In · Distiller",
  description: "Sign in to your Distiller account.",
  alternates: { canonical: "https://distiller.attafii.dev/auth/login" }
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