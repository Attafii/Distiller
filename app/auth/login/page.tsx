import type { Metadata } from "next";
import AuthLayout, { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Distiller account"
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}