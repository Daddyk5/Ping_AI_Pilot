"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const displayName = String(formData.get("displayName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!displayName || !email || password.length < 8) {
          setError("Name, email, and a password of at least 8 characters are required.");
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const origin = window.location.origin;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
              display_name: displayName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setMessage("Registration received. Check your email to confirm the account before logging in.");
      } catch (registerError) {
        setError(registerError instanceof Error ? registerError.message : "Unable to create account.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Display name</span>
        <input
          name="displayName"
          type="text"
          autoComplete="name"
          required
          className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
          placeholder="Flight Engineer"
        />
      </label>
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
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
          placeholder="Minimum 8 characters"
        />
      </label>
      {error && <p className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {message && <p className="rounded border border-lime-300/30 bg-lime-300/10 p-3 text-sm text-lime-200">{message}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-cyan-300/50 bg-cyan-300/15 px-5 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" aria-hidden />
        {isPending ? "Creating account" : "Create Account"}
      </button>
    </form>
  );
}
