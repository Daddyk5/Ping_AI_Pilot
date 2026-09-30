"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";
import { AuthAlert, AuthField, authSubmitClassName } from "@/components/auth/AuthField";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "").trim();
      if (!email) {
        setError("Enter the email address for your account.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(MISSING_SUPABASE_BROWSER_ENV);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(getAuthErrorMessage(resetError));
        return;
      }

      setSent(true);
    });
  }

  if (sent) {
    return (
      <AuthAlert tone="success">
        If an account exists for that email, a password reset link is on its way. The link expires after one hour.
      </AuthAlert>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="Email" name="email" type="email" autoComplete="email" required placeholder="pilot@example.com" />
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <button type="submit" disabled={isPending} className={authSubmitClassName}>
        <Mail className="h-4 w-4" aria-hidden />
        {isPending ? "Sending" : "Send reset link"}
      </button>
    </form>
  );
}
