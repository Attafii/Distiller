import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password · Distiller",
  description: "Reset your Distiller password.",
  alternates: { canonical: "https://distiller.attafii.dev/auth/forgot-password" }
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}