export const FALLBACK_SUPABASE_URL = "https://ciyexgbksveavzkvmcsm.supabase.co";
export const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Qhb_1WUvGAr5MIbkToOdVQ_yu213aaV";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function getPublicSupabaseConfig() {
  const envUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const envKey = readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ?? readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabaseUrl = envUrl && isValidHttpUrl(envUrl) ? envUrl : FALLBACK_SUPABASE_URL;
  const publishableKey = envKey ?? FALLBACK_SUPABASE_PUBLISHABLE_KEY;

  return {
    supabaseUrl,
    publishableKey,
    usingFallback: supabaseUrl === FALLBACK_SUPABASE_URL || publishableKey === FALLBACK_SUPABASE_PUBLISHABLE_KEY,
  };
}
