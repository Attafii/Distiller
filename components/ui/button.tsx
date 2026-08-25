"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "default" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "sheen bg-ink text-paper hover:bg-ember",
  secondary: "border border-line bg-surface-2 text-ink hover:border-ember/50 hover:text-ember",
  outline: "border border-line bg-transparent text-ink hover:border-ember/50 hover:text-ember",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-ink"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs",
  default: "h-10 rounded-md px-4 text-sm",
  lg: "h-11 rounded-md px-5 text-sm",
  icon: "h-9 w-9 rounded-md p-0"
};

export function buttonStyles({
  variant = "default",
  size = "default",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", asChild = false, type = "button", ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} type={type} className={buttonStyles({ variant, size, className })} {...props} />;
});

Button.displayName = "Button";
