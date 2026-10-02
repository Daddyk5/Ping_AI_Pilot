import { afterEach, describe, expect, it, vi } from "vitest";

// public-config reads env at module load, so each case stubs env and re-imports the module.
async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string);
  return import("@/lib/supabase/public-config");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

const URL_ = "https://example.supabase.co";

describe("getPublicSupabaseConfig", () => {
  it("uses the publishable key", async () => {
    const config = await load({ NEXT_PUBLIC_SUPABASE_URL: URL_, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" });
    expect(config.getPublicSupabaseConfig()).toEqual({ supabaseUrl: URL_, publishableKey: "sb_publishable_x" });
  });

  it("accepts the legacy anon key name", async () => {
    const config = await load({ NEXT_PUBLIC_SUPABASE_URL: URL_, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy" });
    expect(config.getPublicSupabaseConfig()?.publishableKey).toBe("legacy");
  });

  it("returns null and names exactly what is missing (never a fallback project)", async () => {
    const config = await load({ NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" });
    expect(config.getPublicSupabaseConfig()).toBeNull();
    expect(config.MISSING_SUPABASE_ENV).toMatch(/NEXT_PUBLIC_SUPABASE_URL is not set/);
    expect(config.MISSING_SUPABASE_ENV).toMatch(/PUBLISHABLE_KEY \(or NEXT_PUBLIC_SUPABASE_ANON_KEY\) is not set/);
  });

  it("rejects a malformed URL", async () => {
    const config = await load({ NEXT_PUBLIC_SUPABASE_URL: "wlidqfizxsjknjhumruw", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "k" });
    expect(config.getPublicSupabaseConfig()).toBeNull();
    expect(config.MISSING_SUPABASE_ENV).toMatch(/not a valid URL/);
  });
});
