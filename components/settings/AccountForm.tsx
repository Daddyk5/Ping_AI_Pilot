"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { AuthAlert, AuthField } from "@/components/auth/AuthField";
import { buttonClass } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";

export function AccountForm({ email, displayName }: { email: string; displayName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const nextName = String(formData.get("displayName") ?? "").trim();
      const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(MISSING_SUPABASE_BROWSER_ENV);
        return;
      }

      const emailChanged = nextEmail !== email.toLowerCase();
      const { error: updateError } = await supabase.auth.updateUser(
        { data: { display_name: nextName }, ...(emailChanged ? { email: nextEmail } : {}) },
        emailChanged ? { emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings` } : undefined,
      );

      if (updateError) {
        setError(getAuthErrorMessage(updateError));
        return;
      }

      setNotice(
        emailChanged
          ? `Saved. To finish changing your email, click the confirmation links sent to ${email} and ${nextEmail}.`
          : "Saved.",
      );
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="Display name" name="displayName" defaultValue={displayName} maxLength={60} autoComplete="name" />
      <AuthField label="Email" name="email" type="email" defaultValue={email} required autoComplete="email" />
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {notice && <AuthAlert tone="success">{notice}</AuthAlert>}
      <button type="submit" disabled={isPending} className={buttonClass()}>
        <Save className="h-4 w-4" aria-hidden />
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
