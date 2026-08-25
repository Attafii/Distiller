"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "border border-ember/25 bg-ember/10 text-ember",
  secondary: "border border-line bg-surface-2 text-ink-2",
  outline: "border border-line bg-transparent text-muted"
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "secondary", ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";
