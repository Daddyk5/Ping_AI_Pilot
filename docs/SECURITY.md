# Security

## Row Level Security audit (2026-09-30)

Every table in `public` has RLS **enabled and forced** (forced means it applies to the table owner too). Every policy is scoped with `(select auth.uid()) = user_id`. `anon` has no access to anything.

| Table | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| `ping_runs` | own | own | — | own | Runs are immutable |
| `ping_results` | own | own, **and** only into the user's own run | — | own | Insert policy checks run ownership, so a user can't attach rows to someone else's run |
| `user_settings` | own | own | own | — | One row per user |
| `rate_limit_hits` | — | — | — | — | No direct access; only via `consume_rate_limit()` |
| ~~`ping_history`~~ | | | | | Legacy: had **no** owner column and RLS was off. Dropped in `202609300005` |

**SQL functions** (both `security definer`, `search_path = ''`, `execute` revoked from `anon`):
- `consume_rate_limit(bucket, max, window)` always acts on `auth.uid()`, so a caller can't touch another user's counters. Its arguments are bounds-checked.
- `admin_usage_stats()` raises `42501` unless the JWT's `app_metadata.role = 'admin'`, and returns aggregate counts only. Users can't write `app_metadata`.

**No service-role key** is used by the app. Every query runs with the user's session. If you ever need one, name it `SUPABASE_SERVICE_ROLE_KEY`, import it only in modules marked `import "server-only"`, never prefix it with `NEXT_PUBLIC_`, and document why here.

To re-audit after adding a table, run this in the SQL editor. Every row should show `rls = true, forced = true`, with at least one policy:

```sql
select c.relname, c.relrowsecurity as rls, c.relforcerowsecurity as forced,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
```

## Defence in depth for authenticated data

1. `proxy.ts` redirects signed-out page requests and returns 401 for `/api/*`.
2. Every page calls `requirePageUser()`, and every route handler calls `authenticateRoute()`. Both use `getUser()`, which is verified with Supabase Auth.
3. Queries also filter by `user_id` explicitly.
4. RLS enforces ownership in Postgres regardless of steps 1–3.

## Input validation

All route handler input is validated with **zod** (`lib/latency/schema.ts`, `lib/ai/schema.ts`, `lib/settings.ts`). Error messages are short and safe to show clients.
- `POST /api/ping-runs`: max 64 KB body, 40 targets, 30 samples each, samples 0–10,000 ms. Game and region ids must exist in the catalog. Labels and hosts come from the server-side catalog, never from the client. All stats are recomputed on the server.
- Custom hosts are normalised and must be a hostname or IPv4 address.
- Redirect targets (`?next=`) are checked by `getSafeRedirectPath()`: same-origin paths only (no `//host`, `/\host` or absolute URLs).

## Rate limits (`lib/rate-limit.ts`)

Enforced per user in Postgres, so they hold across serverless instances.

| Bucket | Limit | On DB failure |
| --- | --- | --- |
| `ping_runs` (saving a test) | 30 per 10 min | fail open (saving results matters more) |

When exceeded, the API returns 429 with `Retry-After`. Supabase Auth applies its own limits to sign-in and email sending (Dashboard → Authentication → Rate Limits).

## HTTP security headers (`next.config.ts`)

Content-Security-Policy (no nonces; see the comments in the config for each directive's rationale), `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, HSTS (2 years, subdomains), `Cross-Origin-Opener-Policy: same-origin`, and no `X-Powered-By`.

`connect-src` allows `https:` because the optimizer's Custom-host test probes arbitrary hosts from the user's own browser. If that feature is removed, tighten it to `'self' https://*.supabase.co wss://*.supabase.co https://*.amazonaws.com`.

## Logging and monitoring

- `lib/logger.ts` writes structured JSON lines (`level`, `event`, `route`, `requestId`, `userId`, `durationMs`), searchable in Vercel logs. Never log tokens, cookies, emails or request bodies.
- Error responses include a `requestId` so a user report can be matched to a log line.
- **Sentry** (`instrumentation*.ts`, `sentry.*.config.ts`) captures unhandled client and server errors (`onRequestError`) plus every `logger.error(...)`. Cookies, headers, bodies and user info are **not** sent (`lib/sentry-options.ts`). Browser events go through the same-origin `/monitoring` tunnel. Everything is a no-op until a DSN is set.

Useful log events: `ping_run.saved`, `ping_run.save_failed`, `ping_run.rate_limited`, `suggestions.failed`, `auth.callback.exchange_failed`, `rate_limit.unavailable`.

## Secrets

`.env*` is gitignored except `.env.example` (no real values). The only server-only secret is `SENTRY_AUTH_TOKEN` (optional, build time). CI builds with placeholder public values and no secrets.
