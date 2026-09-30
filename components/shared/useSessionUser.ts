"use client";

import { useEffect, useState } from "react";
import { isAdminClaims } from "@/lib/auth-roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type SessionUser = { email: string | null; displayName: string | null; isAdmin: boolean };

/** Display-only session info for the app chrome. Authorization is always enforced server-side. */
export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const apply = (authUser: { email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null) =>
      setUser(
        authUser
          ? {
              email: authUser.email ?? null,
              displayName: typeof authUser.user_metadata?.display_name === "string" ? authUser.user_metadata.display_name : null,
              isAdmin: isAdminClaims(authUser.app_metadata),
            }
          : null,
      );

    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => subscription.subscription.unsubscribe();
  }, []);

  return user;
}
