import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// PKCE code exchange: used by Google OAuth and by email links that carry ?code=.
// PKCE links only work in the same browser that started the flow; for email links
// prefer /auth/confirm (token_hash), see docs/AUTH.md.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const providerError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (providerError) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(JSON.stringify({ level: "warn", event: "auth.callback.exchange_failed", code: error.code, message: error.message }));
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
