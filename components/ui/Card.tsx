import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-zinc-950/70 shadow-[0_18px_70px_rgba(0,0,0,0.24),0_0_0_1px_rgba(0,243,255,0.02)] backdrop-blur-xl transition-colors",
        className,
      )}
      {...props}
    />
  );
}
