export const FALLBACK_SUPABASE_URL = "https://ciyexgbksveavzkvmcsm.supabase.co";
export const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Qhb_1WUvGAr5MIbkToOdVQ_yu213aaV";

export function getPublicSupabaseConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL,
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      FALLBACK_SUPABASE_PUBLISHABLE_KEY,
  };
}
