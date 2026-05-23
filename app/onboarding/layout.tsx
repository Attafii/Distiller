import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started · Distiller",
  description: "Set up your Distiller preferences.",
  robots: { index: false, follow: false }
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}