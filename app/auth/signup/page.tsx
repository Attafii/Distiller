import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthForms";
import { SignupForm } from "@/components/auth/AuthForms";
import { SignupSkeleton } from "@/components/auth/AuthSkeleton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Create Account · Distiller",
  description: "Create your free Distiller account.",
  alternates: { canonical: `${siteUrl}/auth/signup` }
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<SignupSkeleton />}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}