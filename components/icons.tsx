import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export function DropletIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.5 12 2.5 12 2.5Z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" opacity={0.7} />
    </svg>
  );
}

export function SparkleIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" opacity={0.7} />
    </svg>
  );
}

export function BookmarkIcon(props: P & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <svg {...base(rest)} fill={filled ? "currentColor" : "none"}>
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function SunIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function SearchIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function LockIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

export function GlobeIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function BoltIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
    </svg>
  );
}

export function ShieldIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5 4.5 5.5v6c0 4.5 3.2 8.4 7.5 10 4.3-1.6 7.5-5.5 7.5-10v-6L12 2.5Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function RssIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 11a8.5 8.5 0 0 1 8.5 8.5" />
      <path d="M4.5 4.5A15.5 15.5 0 0 1 20 20" />
      <circle cx="5.5" cy="18.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LayersIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" opacity={0.6} />
      <path d="m3 17.5 9 5 9-5" opacity={0.35} />
    </svg>
  );
}

export function FileIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

export function ListIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1.5-3.5 4.3-5 7.5-5s6 1.5 7.5 5" />
    </svg>
  );
}

export function GithubIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 19 3.5a5 5 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a13 13 0 0 0-6.8 0C6.1-.3 5 .1 5 .1A5 5 0 0 0 5 3.5a5.5 5.5 0 0 0-1.5 4c0 5.4 3.2 6.6 6.5 7a4.8 4.8 0 0 0-1 3.5v4" />
      <path d="M9 18c-4.5 1.5-4.5-2.5-6-3" />
    </svg>
  );
}

export function FlaskIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M10 3h4M11 3v6.2L5.6 18.4A2 2 0 0 0 7.3 21.5h9.4a2 2 0 0 0 1.7-3.1L13 9.2V3" />
      <path d="M8 15.5h8" opacity={0.6} />
    </svg>
  );
}

export function ArrowUpRightIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ArrowLeftIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function QuoteIcon(props: P) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M9.5 5.5C6.5 6.8 4.8 9.4 4.8 12.6c0 3.2 1.9 5.4 4.4 5.4 2 0 3.6-1.4 3.6-3.4s-1.4-3.3-3.2-3.3c-.3 0-.7 0-1 .2.4-1.8 1.8-3.3 3.6-4.2l-2.7-1.8Zm8.6 0C15.1 6.8 13.4 9.4 13.4 12.6c0 3.2 1.9 5.4 4.4 5.4 2 0 3.6-1.4 3.6-3.4s-1.4-3.3-3.2-3.3c-.3 0-.7 0-1 .2.4-1.8 1.8-3.3 3.6-4.2l-2.7-1.8Z" />
    </svg>
  );
}

export function GridIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function RowsIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="6" rx="1.5" />
      <rect x="3.5" y="13.5" width="17" height="6" rx="1.5" />
    </svg>
  );
}

export function ClockIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

export function MailIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 7 8.4 6 8.4-6" />
    </svg>
  );
}

export function ShareIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4" />
    </svg>
  );
}

export function MenuIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function XIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SlidersIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}
