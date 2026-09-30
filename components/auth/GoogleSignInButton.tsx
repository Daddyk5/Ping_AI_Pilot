"use client";

import { useState } from "react";
import { getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth-shared";
import { createSupabaseBrowserClient, MISSING_SUPABASE_BROWSER_ENV } from "@/lib/supabase/browser";
import { AuthAlert } from "@/components/auth/AuthField";

export function GoogleSignInButton({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function signIn() {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(MISSING_SUPABASE_BROWSER_ENV);
      return;
    }

    setIsPending(true);
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", getSafeRedirectPath(next));

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    // On success the browser navigates away to Google, so only errors land here.
    if (oauthError) {
      setError(getAuthErrorMessage(oauthError));
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signIn}
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg aria-hidden viewBox="0 0 48 48" className="h-4 w-4">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {isPending ? "Redirecting to Google" : "Continue with Google"}
      </button>
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-zinc-600">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
