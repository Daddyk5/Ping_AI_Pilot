# Authentication

Ping AI Pilot uses **Supabase Auth** through `@supabase/ssr`. Sessions live in cookies, so the browser, the server components, the route handlers and the proxy all see the same session.

## Files

| File | Runs in | Purpose |
| --- | --- | --- |
| `lib/supabase/public-config.ts` | both | Reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `lib/supabase/browser.ts` | client | `createSupabaseBrowserClient()` for client components (login forms, sign-out) |
| `lib/supabase/server.ts` | server | `createSupabaseServerClient()` for server components and route handlers |
| `lib/supabase/proxy.ts` | proxy | `updateSession()` refreshes the access token and rewrites cookies |
| `proxy.ts` | proxy | Runs on every request: refreshes the session, redirects signed-out users |
| `lib/auth.ts` | server | `getCurrentUser()`, `authenticateRoute()` (route handlers → 401 response), `requirePageUser()` (pages → redirect), `isAdmin()` |
| `lib/auth-shared.ts` | both | Safe redirect check (`getSafeRedirectPath`) and readable error messages (`getAuthErrorMessage`) |
| `app/auth/callback/route.ts` | server | PKCE `?code=` exchange (Google OAuth, default email links) |
| `app/auth/confirm/route.ts` | server | `?token_hash=&type=` verification (email links that work in any browser) |

> **Next.js 16 note:** `middleware.ts` has been renamed to `proxy.ts` (exported function `proxy`). Do not add a `middleware.ts` file.

## Flows

**Email + password sign-up.** `RegisterForm` → `supabase.auth.signUp()`. If email confirmation is on, Supabase sends a link. The link lands on `/auth/callback` (or `/auth/confirm`, see below), which creates the session and redirects to `/dashboard`. If the email is already registered, Supabase returns a user with `identities: []` instead of an error. The form detects this and says so.

**Login.** `LoginForm` → `signInWithPassword()`. Errors are mapped by `error.code`:
- `invalid_credentials` → "Incorrect email or password"
- `email_not_confirmed` → message plus a **Resend confirmation email** button
- `over_request_rate_limit` / HTTP 429 → "Too many attempts"

After login the user is sent to `?next=` (checked by `getSafeRedirectPath`, so only same-site paths are allowed) or to `/dashboard`.

**Google OAuth.** `GoogleSignInButton` → `signInWithOAuth({ provider: "google" })` → Google → Supabase → `/auth/callback?code=…` → session → `next`.

**Password reset.** `/forgot-password` → `resetPasswordForEmail()` → email link → `/auth/callback?next=/reset-password` signs the user in with a recovery session → `/reset-password` (requires a session) → `updateUser({ password })`.

**Sign-out.** `SignOutButton` → `supabase.auth.signOut()` → `/welcome`.

## How routes are protected (defence in depth)

1. **`proxy.ts`** runs first. Signed-out requests to any non-public page are redirected to `/login?next=…`, and any `/api/*` request gets a `401`. Signed-in users visiting `/`, `/welcome`, `/login`, `/register` or `/forgot-password` are sent to `/dashboard`.
2. **Every protected page** calls `await requirePageUser("/path")` at the top.
3. **Every route handler** starts with `const auth = await authenticateRoute(); if (!auth.ok) return auth.response;`.
4. **Row Level Security** in Postgres is the final guarantee: queries run as the user, not as the service role.

Proxy alone is not enough. Its matcher can drift, and Next.js docs state that auth must be verified next to the data. Keep steps 2–4 even though step 1 exists.

Public paths are listed in `PUBLIC_PATHS` in `proxy.ts`. Add new public pages there.

## Roles

Admins are users with `app_metadata.role = "admin"`. Only the service role or SQL can set `app_metadata`, never the user. To grant the role:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';
```

The user must sign in again to pick up the claim. `/admin` checks `isAdmin(user)` and returns a 404 to everyone else. The `admin_usage_stats()` SQL function re-checks the JWT claim itself. The nav link visibility (`useSessionUser`) is cosmetic only.

## Rules that prevent the "random logout" bugs

- **Never read `NEXT_PUBLIC_*` variables dynamically** (`process.env[name]`). Next.js only fills them in for the browser when written literally. A dynamic lookup silently returns `undefined` in the browser. This was the original bug: the browser fell back to a hard-coded old Supabase project while the server used the new one.
- **Use `getUser()` on the server, never `getSession()`.** `getSession()` trusts the cookie without checking it.
- **Don't run code between `createServerClient()` and `getUser()` in `lib/supabase/proxy.ts`.** `getUser()` is what refreshes the token.
- **When proxy redirects, copy the refreshed cookies onto the redirect** (`redirectWithCookies` in `proxy.ts`). Otherwise the new tokens are dropped and the user is logged out on their next request.
- Server components can't write cookies; the empty `catch` in `lib/supabase/server.ts` is intentional because proxy writes them.

## Supabase dashboard configuration (manual, one time)

Project: `wlidqfizxsjknjhumruw`.

1. **Authentication → URL Configuration**
   - Site URL: your production URL (e.g. `https://<app>.vercel.app`)
   - Redirect URLs: add `http://localhost:3000/**`, `https://<app>.vercel.app/**`, and `https://*-<vercel-team>.vercel.app/**` (preview deployments)
2. **Authentication → Providers → Google**: enable it and paste the Client ID / Secret from a Google Cloud OAuth client (type "Web application"). In Google Cloud, set the authorised redirect URI to `https://wlidqfizxsjknjhumruw.supabase.co/auth/v1/callback`.
3. **Optional but recommended: email links that work in any browser.** PKCE links (`?code=`) only work in the browser that started the flow. Opening a confirmation email on your phone after signing up on desktop fails with "link expired". To avoid this, edit **Authentication → Email Templates**:
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
4. **Rate limits**: Authentication → Rate Limits. The built-in SMTP sender only allows a few emails per hour. Configure custom SMTP before launch.

## Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Must be set in Vercel for Production **and** Preview. Filled in at build time, so redeploy after changing it. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | Publishable key (`sb_publishable_…`). Safe to expose. |

No code path uses a service-role key (the legacy `lib/supabase.ts` admin client was removed). If one is ever needed, it must be `SUPABASE_SERVICE_ROLE_KEY`, used only in server code (import `server-only`), and never prefixed with `NEXT_PUBLIC_`.

## Debugging checklist

- "Session not found" / logged out on refresh → check that the env vars are set in the Vercel environment you're on, and that you redeployed after setting them.
- Redirected to `/login?error=auth_callback_failed` → the email link was opened in a different browser, or it expired. See config step 3.
- OAuth returns to the wrong domain → the domain is missing from Redirect URLs (step 1).
- Server logs: search for `auth.callback.exchange_failed` / `auth.confirm.verify_failed` (JSON lines with the Supabase error code).
