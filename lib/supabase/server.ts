import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig, MISSING_SUPABASE_ENV } from "@/lib/supabase/public-config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = getPublicSupabaseConfig();

  if (!config) {
    throw new Error(MISSING_SUPABASE_ENV);
  }

  return createServerClient(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Safe to ignore because proxy.ts
          // refreshes the session and writes cookies on every request.
        }
      },
    },
  });
}
