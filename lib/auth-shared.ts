// Auth helpers that are safe to import from both server and client code.

const DEFAULT_REDIRECT = "/dashboard";

/**
 * Only allow same-origin relative paths as post-login redirect targets.
 * Rejects absolute URLs, protocol-relative URLs ("//evil.com") and backslash tricks ("/\evil.com").
 */
export function getSafeRedirectPath(next: string | null | undefined, fallback = DEFAULT_REDIRECT) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }

  try {
    const url = new URL(next, "http://localhost");
    if (url.origin !== "http://localhost") {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

type AuthErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

export type AuthErrorKind = "invalid_credentials" | "email_not_confirmed" | "rate_limited" | "weak_password" | "user_exists" | "same_password" | "link_expired" | "unknown";

export function classifyAuthError(error: AuthErrorLike): AuthErrorKind {
  if (!error) return "unknown";

  switch (error.code) {
    case "invalid_credentials":
      return "invalid_credentials";
    case "email_not_confirmed":
      return "email_not_confirmed";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rate_limited";
    case "weak_password":
      return "weak_password";
    case "user_already_exists":
    case "email_exists":
      return "user_exists";
    case "same_password":
      return "same_password";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return "link_expired";
  }

  if (error.status === 429) return "rate_limited";
  return "unknown";
}

const AUTH_ERROR_MESSAGES: Record<AuthErrorKind, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email address first. Check your inbox for the confirmation link.",
  rate_limited: "Too many attempts. Please wait a minute and try again.",
  weak_password: "That password is too weak. Use at least 8 characters with a mix of letters, numbers and symbols.",
  user_exists: "An account with this email already exists. Try logging in or resetting your password.",
  same_password: "Your new password must be different from your current password.",
  link_expired: "This link has expired or was opened in a different browser. Please request a new one.",
  unknown: "Something went wrong. Please try again.",
};

export function getAuthErrorMessage(error: AuthErrorLike) {
  const kind = classifyAuthError(error);
  if (kind === "unknown" && error?.message) {
    return error.message;
  }
  return AUTH_ERROR_MESSAGES[kind];
}

/** Error codes passed via ?error= on the login page by the auth callback routes. */
export const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "We couldn't complete sign-in. The link may have expired. Please try again.",
  missing_code: "The sign-in link is invalid or incomplete.",
};
