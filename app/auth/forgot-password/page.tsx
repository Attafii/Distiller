import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthForms";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Forgot Password · Distiller",
  description: "Reset your Distiller password.",
  alternates: { canonical: `${siteUrl}/auth/forgot-password` }
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
