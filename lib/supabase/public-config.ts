// NEXT_PUBLIC_* values are inlined into the browser bundle at build time, but ONLY
// when referenced literally as `process.env.NEXT_PUBLIC_X`. Dynamic lookups such as
// `process.env[name]` are undefined in the browser, so never refactor these into a helper.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const MISSING_SUPABASE_ENV =
  "Supabase public environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then rebuild.";

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function getPublicSupabaseConfig() {
  if (!SUPABASE_URL || !isValidHttpUrl(SUPABASE_URL) || !SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  return { supabaseUrl: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY };
}
