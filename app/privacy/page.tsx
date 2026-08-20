import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev";

export const metadata: Metadata = {
  title: "Privacy Policy · Distiller",
  description: "Privacy Policy for Distiller — how we collect, use, and protect your data.",
  alternates: { canonical: `${siteUrl}/privacy` },
  openGraph: {
    url: `${siteUrl}/privacy`,
    title: "Privacy Policy · Distiller",
    description: "Privacy Policy for Distiller.",
    images: [{ url: `${siteUrl}/api/og?title=Privacy+Policy`, width: 1200, height: 630, alt: "Privacy" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy · Distiller",
    images: [`${siteUrl}/api/og?title=Privacy+Policy`]
  }
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: June 1, 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. What We Collect</h2>
            <p>We collect: your email address and name (from account creation), your topic and region preferences (from onboarding and settings), your reading history and bookmarks (to power your dashboard), and basic usage data (article views, features used) to improve the Service.</p>
            <p className="mt-2">We <strong>do not sell your personal data</strong> to advertisers or third parties. We do not use advertising tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
            <p>We use your data to: deliver your personalized news briefing, send optional daily email digests if you opt in, power your bookmarks and reading history, improve our AI summarization quality, and communicate account-related notices.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. AI Processing</h2>
            <p>Your article reading activity is processed by our AI pipeline to generate summaries. Source article text is processed in memory only and is not stored beyond the session. Summaries are generated on-demand and are not stored persistently.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Data Retention</h2>
            <p>Your account data is deleted within 30 days of account deletion upon request. Reading history and bookmarks are deleted when you delete your account. Usage analytics are retained in anonymized, aggregated form indefinitely.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Your Rights (GDPR & CCPA)</h2>
            <p><strong>GDPR (EU/EEA users):</strong> You have the right to access, rectification, erasure, portability, and restriction of processing of your personal data. Contact us at <a href="mailto:privacy@distiller.attafii.dev" className="text-primary hover:underline">privacy@distiller.attafii.dev</a>.</p>
            <p className="mt-2"><strong>CCPA (California residents):</strong> You may opt out of the sale of personal information. We do not sell personal information. You may request disclosure of data we hold about you.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>We use only essential cookies for session management (Better Auth). No advertising or tracking cookies are used. Optional analytics (Vercel Analytics) only loads with your cookie consent.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Third-Party Services</h2>
            <p>We use: Neon (PostgreSQL database), Vercel (hosting and analytics), Stripe (payments). Each has their own privacy policy.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Children's Privacy</h2>
            <p>Distiller is not intended for users under 13. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p>Privacy inquiries: <a href="mailto:privacy@distiller.attafii.dev" className="text-primary hover:underline">privacy@distiller.attafii.dev</a></p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <Link href="/RefinedFeed" className="text-sm text-primary hover:underline">← Back to feed</Link>
        </div>
      </div>
    </main>
  );
}