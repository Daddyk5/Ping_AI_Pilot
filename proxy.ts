import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const publicPaths = new Set(["/", "/welcome", "/login", "/register", "/auth/callback"]);
const protectedApiPrefixes = ["/api/ai-coach", "/api/boost", "/api/detect-game", "/api/history", "/api/ping-test", "/api/servers"];

function isPublicPath(pathname: string) {
  return publicPaths.has(pathname);
}

function isProtectedApi(pathname: string) {
  return protectedApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (user && (pathname === "/login" || pathname === "/register" || pathname === "/welcome" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && isProtectedApi(pathname)) {
    return Response.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  if (!user && !isPublicPath(pathname) && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
