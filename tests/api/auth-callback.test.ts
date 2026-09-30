import { describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { exchangeCodeForSession } })),
}));

const { GET } = await import("@/app/auth/callback/route");

function call(query: string) {
  return GET(new Request(`https://app.test/auth/callback${query}`));
}

describe("/auth/callback", () => {
  it("exchanges the code and redirects to next", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await call("?code=abc&next=/history");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://app.test/history");
  });

  it("never redirects off-site", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await call("?code=abc&next=//evil.com");
    expect(response.headers.get("location")).toBe("https://app.test/dashboard");
  });

  it("sends failed exchanges back to login with an error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    exchangeCodeForSession.mockResolvedValue({ error: { code: "bad_code_verifier", message: "x" } });
    const response = await call("?code=abc");
    expect(response.headers.get("location")).toBe("https://app.test/login?error=auth_callback_failed");
  });

  it("handles a missing code", async () => {
    const response = await call("");
    expect(response.headers.get("location")).toBe("https://app.test/login?error=missing_code");
  });

  it("handles provider errors (e.g. user cancelled Google consent)", async () => {
    const response = await call("?error=access_denied");
    expect(response.headers.get("location")).toBe("https://app.test/login?error=auth_callback_failed");
  });
});
