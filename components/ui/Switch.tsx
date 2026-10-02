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
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-left text-sm text-fg-2 transition hover:border-line-strong disabled:opacity-60"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition",
          checked ? "border-accent bg-accent" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] size-4 rounded-full transition-all",
            checked ? "left-[22px] bg-accent-ink" : "left-[3px] bg-fg-3",
          )}
        />
      </span>
    </button>
  );
}
