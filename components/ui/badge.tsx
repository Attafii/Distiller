"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "border border-zinc-100 bg-zinc-100 text-zinc-950",
  secondary: "border border-zinc-800 bg-zinc-900 text-zinc-200",
  outline: "border border-zinc-800 bg-transparent text-zinc-300"
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-[0.08em]",
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";
