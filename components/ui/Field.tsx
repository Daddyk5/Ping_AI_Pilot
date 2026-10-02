import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-11 w-full rounded-lg border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none transition placeholder:text-fg-3 hover:border-white/20 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

type FieldShellProps = { label: string; hint?: ReactNode; aside?: ReactNode; error?: string | null; children: ReactNode; className?: string };

/** Label + control + hint/error, with consistent spacing. */
export function Field({ label, hint, aside, error, children, className }: FieldShellProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium text-fg-2">
        {label}
        {aside}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1.5 block text-xs leading-5 text-fg-3">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: CHEVRON }} {...props}>
      {children}
    </select>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8591' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;
