"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
          placeholder="pilot@example.com"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
          placeholder="Enter password"
        />
      </label>
      {error && <p className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-cyan-300/50 bg-cyan-300/15 px-5 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {isPending ? "Authenticating" : "Login"}
      </button>
    </form>
  );
}
