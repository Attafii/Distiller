"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "default" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-zinc-100 text-zinc-950 hover:bg-zinc-300 shadow-sm",
  secondary: "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
  outline: "border border-zinc-800 bg-transparent text-zinc-100 hover:bg-zinc-900",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 rounded-full px-3 text-xs",
  default: "h-10 rounded-full px-4 text-sm",
  lg: "h-11 rounded-full px-5 text-sm"
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
    "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50",
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
