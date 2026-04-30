"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "border border-primary/20 bg-primary/15 text-primary",
  secondary: "border border-secondary bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-muted-foreground"
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
