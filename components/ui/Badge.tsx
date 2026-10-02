import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-white/5 text-fg-2",
  accent: "border-accent/30 bg-accent-soft text-accent",
  success: "border-green-300/25 bg-success-soft text-success",
  warning: "border-yellow-300/25 bg-warning-soft text-warning",
  danger: "border-red-300/25 bg-danger-soft text-danger",
};

export function Badge({ className, tone = "neutral", dot, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
