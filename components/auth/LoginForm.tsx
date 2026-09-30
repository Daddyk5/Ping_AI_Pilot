"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { classifyAuthError, getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";
import { AuthAlert, AuthField, authSubmitClassName } from "@/components/auth/AuthField";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    setUnconfirmedEmail(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(MISSING_SUPABASE_BROWSER_ENV);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (classifyAuthError(signInError) === "email_not_confirmed") {
          setUnconfirmedEmail(email);
        }
        setError(getAuthErrorMessage(signInError));
        return;
      }

      router.replace(getSafeRedirectPath(next));
      router.refresh();
    });
  }

  function resendConfirmation() {
    if (!unconfirmedEmail) return;

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });

      if (resendError) {
        setError(getAuthErrorMessage(resendError));
        return;
      }

      setError(null);
      setUnconfirmedEmail(null);
      setNotice("Confirmation email sent. Check your inbox.");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Your password"
        hint={
          <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-strong">
            Forgot password?
          </Link>
        }
      />
      {error && (
        <AuthAlert tone="error">
          {error}
          {unconfirmedEmail && (
            <button type="button" onClick={resendConfirmation} disabled={isPending} className="mt-2 block font-semibold text-fg underline underline-offset-4">
              Resend confirmation email
            </button>
          )}
        </AuthAlert>
      )}
      {notice && <AuthAlert tone="success">{notice}</AuthAlert>}
      <button type="submit" disabled={isPending} className={authSubmitClassName}>
        <LogIn className="h-4 w-4" aria-hidden />
        {isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
