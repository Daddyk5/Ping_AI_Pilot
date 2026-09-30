import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";

const updateSession = vi.fn();
vi.mock("@/lib/supabase/proxy", () => ({ updateSession }));

const { proxy } = await import("@/proxy");

function session(user: { id: string } | null) {
  const response = NextResponse.next();
  response.cookies.set("sb-test-auth-token", "refreshed");
  updateSession.mockResolvedValue({ response, user });
}

const run = (path: string) => proxy(new NextRequest(`https://app.test${path}`));

describe("proxy (session refresh + route protection)", () => {
  it("redirects signed-out users from protected pages to login, preserving the path", async () => {
    session(null);
    const response = await run("/history?game=dota2");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.test/login?next=%2Fhistory%3Fgame%3Ddota2");
  });

  it("returns 401 JSON for signed-out API calls", async () => {
    session(null);
    const response = await run("/api/ping-test");
    expect(response.status).toBe(401);
  });

  it("lets signed-out users reach public auth pages", async () => {
    session(null);
    for (const path of ["/login", "/register", "/forgot-password", "/auth/callback"]) {
      expect((await run(path)).status).toBe(200);
    }
  });

  it("sends signed-in users away from login to the dashboard, keeping refreshed cookies", async () => {
    session({ id: "u1" });
    const response = await run("/login");
    expect(response.headers.get("location")).toBe("https://app.test/dashboard");
    expect(response.headers.get("set-cookie")).toContain("sb-test-auth-token=refreshed");
  });

  it("passes signed-in requests through", async () => {
    session({ id: "u1" });
    const response = await run("/dashboard");
    expect(response.status).toBe(200);
  });
});
