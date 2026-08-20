import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthForms";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { LoginSkeleton } from "@/components/auth/AuthSkeleton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Reset Password · Distiller",
  description: "Set a new password for your Distiller account.",
  alternates: { canonical: `${siteUrl}/auth/reset-password` }
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
