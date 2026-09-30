import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
};

export function AuthField({ label, hint, ...inputProps }: AuthFieldProps) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
        {hint}
      </span>
      <input
        {...inputProps}
        className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
      />
    </label>
  );
}

export function AuthAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const styles =
    tone === "error" ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-lime-300/30 bg-lime-300/10 text-lime-200";

  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded border p-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export const authSubmitClassName =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-cyan-300/50 bg-cyan-300/15 px-5 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-60";
