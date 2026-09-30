"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig, MISSING_SUPABASE_ENV } from "@/lib/supabase/public-config";

export const MISSING_SUPABASE_BROWSER_ENV = MISSING_SUPABASE_ENV;

export function createSupabaseBrowserClient() {
  const config = getPublicSupabaseConfig();

  if (!config) {
    return null;
  }

  // createBrowserClient is a singleton in the browser, so calling this repeatedly is cheap.
  return createBrowserClient(config.supabaseUrl, config.publishableKey);
}
