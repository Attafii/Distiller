import type { Metadata } from "next";
import Link from "next/link";

import AuthLayout from "@/components/auth/AuthForms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Password reset is not available yet"
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <Card className="border-border bg-card shadow-soft">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Password reset</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Password reset is not enabled in this environment yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Use the email and password you signed up with, or contact support if you need help accessing your account.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}