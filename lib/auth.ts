import "server-only";

import { redirect } from "next/navigation";
import { isAdminClaims } from "@/lib/auth-roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the verified user or null. Uses getUser() (validated against Supabase Auth)
 * rather than getSession() (unverified cookie contents) — never trust getSession() on the server.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

/** For server components/pages: redirects to /login when there is no session. */
export async function requirePageUser(currentPath: string) {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  return { supabase, user };
}

/**
 * For route handlers: `const auth = await authenticateRoute(); if (!auth.ok) return auth.response;`
 * Returns a 401 JSON response when there is no verified session.
 */
export async function authenticateRoute() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return { ok: false as const, response: Response.json({ success: false, error: "Authentication required." }, { status: 401 }) };
  }

  return { ok: true as const, supabase, user };
}

type AppUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>["user"]>;

/** Admin = app_metadata.role "admin". Users cannot set app_metadata themselves. */
export function isAdmin(user: Pick<AppUser, "app_metadata"> | null | undefined) {
  return isAdminClaims(user?.app_metadata);
}
