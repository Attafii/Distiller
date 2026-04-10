import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono"
});

export const metadata: Metadata = {
  title: {
    default: "Distiller",
    template: "%s · Distiller"
  },
  description: "A monochrome AI news intelligence feed built with Next.js 15 and NVIDIA Build models."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  );
}
