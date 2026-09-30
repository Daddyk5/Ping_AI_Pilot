import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const config = getPublicSupabaseConfig();

  if (!config) {
    return { response, user: null };
  }

  const supabase = createServerClient(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not run code between createServerClient and getUser(): getUser() is what
  // refreshes an expired access token and triggers setAll() with the new cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
