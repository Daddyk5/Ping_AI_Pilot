import { describe, expect, it } from "vitest";
import { classifyAuthError, getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth-shared";

describe("getSafeRedirectPath", () => {
  it("keeps same-site paths, including query and hash", () => {
    expect(getSafeRedirectPath("/history?game=dota2#top")).toBe("/history?game=dota2#top");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["relative without slash", "dashboard"],
    ["javascript scheme", "javascript:alert(1)"],
  ])("falls back for %s", (_label, input) => {
    expect(getSafeRedirectPath(input)).toBe("/dashboard");
  });

  it("uses a custom fallback", () => {
    expect(getSafeRedirectPath("//evil.com", "/reset-password")).toBe("/reset-password");
  });
});

describe("classifyAuthError", () => {
  it.each([
    [{ code: "invalid_credentials", status: 400 }, "invalid_credentials"],
    [{ code: "email_not_confirmed", status: 400 }, "email_not_confirmed"],
    [{ code: "over_request_rate_limit", status: 429 }, "rate_limited"],
    [{ code: "over_email_send_rate_limit", status: 429 }, "rate_limited"],
    [{ status: 429 }, "rate_limited"],
    [{ code: "otp_expired", status: 403 }, "link_expired"],
    [{ code: "bad_code_verifier", status: 400 }, "link_expired"],
    [{ code: "user_already_exists" }, "user_exists"],
    [{ code: "something_new", status: 500 }, "unknown"],
    [null, "unknown"],
  ] as const)("%j -> %s", (error, kind) => {
    expect(classifyAuthError(error)).toBe(kind);
  });
});

describe("getAuthErrorMessage", () => {
  it("returns a friendly message for known errors", () => {
    expect(getAuthErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe(
      "Incorrect email or password.",
    );
  });

  it("passes through the Supabase message for unknown errors", () => {
    expect(getAuthErrorMessage({ code: "hook_timeout", message: "Hook timed out" })).toBe("Hook timed out");
  });
});
