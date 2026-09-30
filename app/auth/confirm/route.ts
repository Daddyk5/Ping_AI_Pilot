import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

// Token-hash verification for email links (sign-up confirmation, password recovery).
// Unlike PKCE (/auth/callback), this works even if the link is opened in another browser.
// Requires the Supabase email templates to link here; see docs/AUTH.md.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const fallback = type === "recovery" ? "/reset-password" : "/dashboard";
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"), fallback);

  if (!tokenHash || !type || !EMAIL_OTP_TYPES.includes(type)) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error(JSON.stringify({ level: "warn", event: "auth.confirm.verify_failed", type, code: error.code, message: error.message }));
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
