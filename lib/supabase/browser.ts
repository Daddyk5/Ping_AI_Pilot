"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

export const MISSING_SUPABASE_BROWSER_ENV =
  "Supabase public environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your deployment environment, then rebuild.";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, publishableKey } = getPublicSupabaseConfig();

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, publishableKey);
}
