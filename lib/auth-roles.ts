// Client-safe copy of the admin check, for showing/hiding nav links only.
// Real authorization happens server-side (requirePageUser + isAdmin, and the SQL function).
export function isAdminClaims(appMetadata: Record<string, unknown> | undefined | null) {
  return appMetadata?.role === "admin";
}
