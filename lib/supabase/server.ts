import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, publishableKey } = getPublicSupabaseConfig();

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can read cookies but cannot always write them.
        }
      },
    },
  });
}
