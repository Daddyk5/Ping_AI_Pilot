import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded border px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        variant === "primary" &&
          "border-cyan-300/50 bg-cyan-300/15 text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] hover:bg-cyan-300/25",
        variant === "ghost" &&
          "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-cyan-300/40 hover:text-cyan-100",
        className,
      )}
      {...props}
    />
  );
}
