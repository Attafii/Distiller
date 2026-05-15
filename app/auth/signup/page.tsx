import type { Metadata } from "next";
import AuthLayout, { SignupForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your free Distiller account"
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}