"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TOPICS = [
  "World", "Politics", "Technology", "AI", "LLM", "Science",
  "Business", "Finance", "Stocks", "Climate", "Health", "Education",
  "Sports", "Entertainment", "Culture"
];

const REGIONS = [
  "Global", "Tunisia", "United States", "United Kingdom", "Canada",
  "Australia", "India", "Germany", "France", "Japan", "China",
  "Russia", "Brazil", "UAE", "Singapore"
];

const DELIVERY_OPTIONS = [
  { id: "web", label: "Web feed", desc: "Browse your personalized feed anytime" },
  { id: "email", label: "Daily email", desc: "Get top stories delivered to your inbox each morning" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [topics, setTopics] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>(["Global"]);
  const [delivery, setDelivery] = useState("web");
  const [loading, setLoading] = useState(false);

  function toggleTopic(t: string) {
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleRegion(r: string) {
    setRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          regions,
          deliveryPreference: delivery,
          onboardingCompleted: true
        })
      });
      router.push("/RefinedFeed?onboarded=true");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h12M4 18h8" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold">Distiller</span>
          </Link>

          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  step >= s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                }`}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`h-px w-12 transition-colors ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">What topics matter to you?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select at least 3. You can change these anytime in settings.</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          topics.includes(topic)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={topics.length < 3}
                    className="w-full"
                  >
                    Next →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Which regions do you follow?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select at least 1. Global is pre-selected.</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          regions.includes(region)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                    <Button onClick={() => setStep(3)} disabled={regions.length === 0} className="flex-1">Next →</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">How do you want your briefing?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Choose how you consume your news.</p>
                  <div className="space-y-3 mb-6">
                    {DELIVERY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setDelivery(opt.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          delivery === opt.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                          </div>
                          <div className={`flex size-5 items-center justify-center rounded-full border-2 text-xs ${
                            delivery === opt.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}>
                            {delivery === opt.id && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Back</Button>
                    <Button onClick={handleFinish} disabled={loading} className="flex-1">
                      {loading ? "Saving..." : "Finish setup →"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}