import Link from "next/link";
import {
  ArrowUpRightIcon,
  FlaskIcon,
  GithubIcon,
  RssIcon,
} from "@/components/icons";

const cols: { title: string; links: { label: string; href: string; external?: boolean }[] }[] =
  [
    {
      title: "Product",
      links: [
        { label: "Browse the feed", href: "/feed" },
        { label: "Ask the news", href: "/ask" },
        { label: "Pricing", href: "/pricing" },
        { label: "RSS feed", href: "/api/feed" },
        { label: "How it works", href: "/#how" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/#about" },
        { label: "MENA coverage", href: "/feed?region=MENA" },
        { label: "Twitter", href: "https://twitter.com", external: true },
        { label: "GitHub", href: "https://github.com", external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "/legal/terms" },
        { label: "Privacy", href: "/legal/privacy" },
      ],
    },
  ];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper transition group-hover:bg-ember">
                <FlaskIcon width={17} height={17} />
              </span>
              <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
                Distiller
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The world&apos;s news, three bullets. Concise, verified briefings for
              curious minds — every claim traced back to its source.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="/api/feed"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted transition hover:border-ember hover:text-ember"
              >
                <RssIcon width={12} height={12} /> RSS
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted transition hover:border-ember hover:text-ember"
              >
                <GithubIcon width={12} height={12} /> GitHub
                <ArrowUpRightIcon width={10} height={10} />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-faint">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="underline-draw text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-faint">© 2026 Distiller.</p>
          <p className="text-xs text-faint">
            We use a session cookie for authentication. No tracking or advertising
            cookies.{" "}
            <Link
              href="/legal/privacy"
              className="underline-draw text-muted hover:text-ink"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
