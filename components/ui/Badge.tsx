import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "cyan" | "green" | "yellow" | "red" | "neutral";

const tones: Record<BadgeTone, string> = {
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  green: "border-lime-300/30 bg-lime-300/10 text-lime-200 shadow-[0_0_16px_rgba(57,255,20,0.22)]",
  yellow: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
  red: "border-red-400/30 bg-red-500/10 text-red-200",
  neutral: "border-white/10 bg-white/5 text-zinc-300",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
