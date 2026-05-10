import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AuthenticationError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "AuthenticationError";
  }
}

export function isAuthenticationError(error: unknown) {
  return error instanceof AuthenticationError;
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError();
  }

  return user;
}
