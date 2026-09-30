"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";
import { AuthAlert, AuthField, authSubmitClassName } from "@/components/auth/AuthField";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const displayName = String(formData.get("displayName") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!displayName || !email || password.length < 8) {
        setError("Name, email, and a password of at least 8 characters are required.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(MISSING_SUPABASE_BROWSER_ENV);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: { display_name: displayName },
        },
      });

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError));
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      // With email confirmation on, Supabase hides whether the address is taken (to prevent
      // account enumeration) by returning a user with no identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        setError(getAuthErrorMessage({ code: "user_already_exists" }));
        return;
      }

      setMessage("Account created. Check your email and click the confirmation link, then log in.");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="Display name" name="displayName" type="text" autoComplete="name" required placeholder="Flight Engineer" />
      <AuthField label="Email" name="email" type="email" autoComplete="email" required placeholder="pilot@example.com" />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        placeholder="Minimum 8 characters"
      />
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {message && <AuthAlert tone="success">{message}</AuthAlert>}
      <button type="submit" disabled={isPending} className={authSubmitClassName}>
        <UserPlus className="h-4 w-4" aria-hidden />
        {isPending ? "Creating account" : "Create Account"}
      </button>
    </form>
  );
}
