"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";
import { AuthAlert, AuthField, authSubmitClassName } from "@/components/auth/AuthField";
import { buttonClass } from "@/components/ui/Button";

export function ResetPasswordForm({
  redirectTo = "/dashboard?passwordUpdated=1",
  submitLabel = "Set new password",
  compact = false,
}: {
  redirectTo?: string | null;
  submitLabel?: string;
  /** Normal-size button (settings) instead of the full-width auth-page button. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const password = String(formData.get("password") ?? "");
      const confirm = String(formData.get("confirm") ?? "");

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(MISSING_SUPABASE_BROWSER_ENV);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(getAuthErrorMessage(updateError));
        return;
      }

      if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <AuthField label="Confirm password" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {saved && <AuthAlert tone="success">Password updated.</AuthAlert>}
      <button type="submit" disabled={isPending} className={compact ? buttonClass() : authSubmitClassName}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
