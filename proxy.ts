import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed middleware.ts -> proxy.ts. This runs before every matched request.
//
// Proxy is an optimistic first line of defence only: every protected page and route
// handler ALSO verifies the session itself (see lib/auth.ts). See docs/AUTH.md.

const PUBLIC_PATHS = new Set(["/", "/welcome", "/login", "/register", "/forgot-password"]);
const PUBLIC_PREFIXES = ["/auth/"];
const GUEST_ONLY_PATHS = new Set(["/", "/welcome", "/login", "/register", "/forgot-password"]);

function isPublicPath(pathname: string) {
  // /dev/* is the design preview with sample data; its routes 404 in production builds.
  if (process.env.NODE_ENV !== "production" && pathname.startsWith("/dev/")) return true;
  return PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Redirects must carry over any refreshed auth cookies, or the refreshed session is lost. */
function redirectWithCookies(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (user && GUEST_ONLY_PATHS.has(pathname)) {
    return redirectWithCookies(new URL("/dashboard", request.url), response);
  }

  if (!user && pathname.startsWith("/api/") && !isPublicPath(pathname)) {
    return Response.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(loginUrl, response);
  }

  return response;
}

export const config = {
  // /monitoring is the Sentry tunnel: it must accept error reports from signed-out pages too.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|games/|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
