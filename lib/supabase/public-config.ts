// NEXT_PUBLIC_* values are inlined into the browser bundle at build time, but ONLY
// when referenced literally as `process.env.NEXT_PUBLIC_X`. Dynamic lookups such as
// `process.env[name]` are undefined in the browser, so never refactor these into a helper.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
// NEXT_PUBLIC_SUPABASE_ANON_KEY is Supabase's older name for the same public key; accepted so
// existing Vercel/.env setups keep working.
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Lists what's wrong (never the values themselves), e.g. for the error shown on the login page. */
export function describeSupabaseEnvProblems(url = SUPABASE_URL, key = SUPABASE_PUBLISHABLE_KEY) {
  const problems: string[] = [];
  if (!url) problems.push("NEXT_PUBLIC_SUPABASE_URL is not set");
  else if (!isValidHttpUrl(url)) problems.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
  if (!key) problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is not set");
  return problems;
}

const problems = describeSupabaseEnvProblems();

export const MISSING_SUPABASE_ENV = problems.length
  ? `Supabase configuration error: ${problems.join("; ")}. Add them to .env.local (local) or to Vercel → Settings → Environment Variables for this environment, then redeploy. These values are baked in at build time.`
  : "Supabase configuration error.";

export function getPublicSupabaseConfig() {
  if (problems.length > 0 || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  return { supabaseUrl: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY };
}
