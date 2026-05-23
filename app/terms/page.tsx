import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · Distiller",
  description: "Terms of Service for Distiller — AI-powered news intelligence platform.",
  alternates: { canonical: "https://distiller.attafii.dev/terms" },
  openGraph: {
    url: "https://distiller.attafii.dev/terms",
    title: "Terms of Service · Distiller",
    description: "Terms of Service for Distiller.",
    images: [{ url: "https://distiller.attafii.dev/api/og?title=Terms+of+Service", width: 1200, height: 630, alt: "Terms" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service · Distiller",
    images: ["https://distiller.attafii.dev/api/og?title=Terms+of+Service"]
  }
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Effective date: June 1, 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Distiller ("the Service"), you agree to be bound by these Terms of Service ("ToS"). If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
            <p>Distiller is an AI-powered news intelligence platform that aggregates, summarizes, and delivers news content in concise brief formats. The Service uses Retrieval-Augmented Generation (RAG) and large language models to generate summaries of third-party news articles. Distiller does not publish original news content.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. User Accounts and Eligibility</h2>
            <p>You must be at least 13 years old to create an account. You agree to provide accurate information and keep your credentials secure. You are responsible for all activity under your account.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Subscription Plans and Billing</h2>
            <p>Distiller offers Free, Pro, Team, and API plans. Paid plans are billed monthly or annually as selected. By subscribing to a paid plan you authorize us to charge your payment method on a recurring basis until you cancel. All fees are non-refundable except where required by law.</p>
            <p className="mt-2"><strong>Free Trial:</strong> Pro and Team plans include a 7-day free trial. Cancel before the trial ends and you will not be charged. If you do not cancel, your subscription auto-renews at the end of the trial period.</p>
            <p className="mt-2"><strong> Cancellation:</strong> You may cancel your subscription at any time from your dashboard. Cancellations take effect immediately. Downgrades to the Free plan take effect at the end of your current billing period.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p>You agree not to: (a) scrape, resell, or redistribute the AI-generated summaries or any content from the Service; (b) use automated bots or crawlers without prior written consent; (c) attempt to extract source article text for purposes of reproducing original journalism; (d) use the Service in any way that violates applicable law.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. AI-Generated Content Disclaimer</h2>
            <p>Distiller uses AI to summarize third-party articles. These summaries may contain errors, omissions, or inaccuracies. Summaries are grounded in source text using RAG but the model may infer information not present in the original source. <strong>Always verify with the original source before making decisions based on Distiller content.</strong></p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p>You retain ownership of your user data. Distiller and its sources retain their respective intellectual property rights. The underlying news articles belong to their respective publishers. Distiller trademarks, logos, and the Service design are property of Distiller.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISTILLER IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL LIABILITY FOR DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Governing Law and GDPR Compliance</h2>
            <p>These Terms are governed by the laws of Tunisia. For users in the European Union or European Economic Area, we comply with the General Data Protection Regulation (GDPR). You have the right to access, correct, delete, or port your personal data. Contact us at <a href="mailto:privacy@distiller.attafii.dev" className="text-primary hover:underline">privacy@distiller.attafii.dev</a>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For legal inquiries, contact: <a href="mailto:legal@distiller.attafii.dev" className="text-primary hover:underline">legal@distiller.attafii.dev</a></p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <Link href="/RefinedFeed" className="text-sm text-primary hover:underline">← Back to feed</Link>
        </div>
      </div>
    </main>
  );
}