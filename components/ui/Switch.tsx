"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = {
  label: string;
  /** Controlled mode: pass `checked` + `onCheckedChange`. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Uncontrolled mode. */
  defaultChecked?: boolean;
  disabled?: boolean;
};

export function Switch({ label, checked: controlled, onCheckedChange, defaultChecked = false, disabled }: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const checked = controlled ?? internal;

  function toggle() {
    const next = !checked;
    if (controlled === undefined) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      className="flex w-full items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-200 disabled:opacity-60"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition",
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
