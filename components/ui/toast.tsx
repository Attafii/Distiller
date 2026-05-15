"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

interface ToastProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
}

const variantStyles: Record<string, string> = {
  default: "border-border bg-card",
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-destructive/30 bg-destructive/5",
  info: "border-blue-500/30 bg-blue-500/10"
};

const variantIcons: Record<string, string> = {
  default: "",
  success: "✓",
  error: "✕",
  info: "ℹ"
};

export function Toast({ children, variant = "default", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`ToastContainer_root__ transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${variantStyles[variant]} flex min-w-[280px] max-w-md items-center gap-3 rounded-xl border px-4 py-3 shadow-elevated`}
    >
      {variant !== "default" && (
        <span className="text-sm font-medium" aria-hidden="true">
          {variantIcons[variant]}
        </span>
      )}
      <p className="flex-1 text-sm text-foreground">{children}</p>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}