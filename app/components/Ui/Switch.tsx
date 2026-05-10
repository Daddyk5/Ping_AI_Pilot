"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";

export function Switch({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => setChecked((value) => !value)}
      className="flex w-full items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-200"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full border transition",
          checked ? "border-cyan-300/60 bg-cyan-300/20" : "border-white/15 bg-zinc-900",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full bg-zinc-300 transition",
            checked ? "left-6 bg-cyan-200 shadow-[0_0_12px_rgba(0,243,255,0.6)]" : "left-1",
          )}
        />
      </span>
    </button>
  );
}
