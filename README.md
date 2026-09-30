# PingPilot AI

[![CI](https://github.com/Daddyk5/Ping_AI_Pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/Daddyk5/Ping_AI_Pilot/actions/workflows/ci.yml)

**Find the fastest server for your game, tested from your own connection.**

PingPilot AI helps gamers choose the best server region. Pick a game, and the app tests every one of its server regions from the player's own internet connection. It then recommends the best region and explains why. Every test is saved, so players can see how their connection behaves over days and weeks, not just in one snapshot.

**Supported games:** Dota 2 · Mobile Legends: Bang Bang · Delta Force · Counter-Strike 2 · League of Legends · plus any custom server. Valorant is listed as *coming soon* (see [Known limitations](#known-limitations)).

---

## What players get

### 🎯 Game Ping Optimizer
- Choose a game and test all of its regions in about 20 seconds, with live progress.
- Get a clear **recommended region**, the runner-up, and a note when two regions are effectively tied.
- See the results as a ranking chart, a per-request timeline, and a table with median ping, worst-case (95th percentile) ping, jitter and failed requests.
- Each region gets a quality rating: *Excellent / Good / Fair / Poor / Unreachable*.

### 💡 Personal suggestions
Plain-language advice based on the player's own history, for example:
- *"Play Dota 2 on SE Asia. It has been consistently about 40 ms faster for you than Hong Kong."*
- *"Your connection is less stable in the evening. Use a wired connection and pause downloads on other devices."*
- *"You get occasional lag spikes. Pause cloud backups and game updates while playing."*

Every suggestion shows the numbers behind it. Suggestions are generated instantly by a built-in rules engine, with no third-party AI service, API keys or running costs.

### 📈 Dashboard and history
- **Dashboard:** recent tests, key numbers, the player's main route over time, suggestions, and one-click launch per game.
- **History:** every test ever run, filterable by game, server region and date.
- **Settings:** name, email, password, default game, and notification preferences.

### 🔐 Accounts
Sign up with email and password or **Continue with Google**. Includes email confirmation, password reset, and clear error messages (wrong password, unconfirmed email, too many attempts).

### 🛠️ Admin analytics (owner only)
Aggregate usage stats: users, active users, tests per day, and most-tested games. Only anonymous totals are shown, never individual users' data.

---

## Why the results can be trusted

**It measures the player's real connection.** Tests run in the player's own browser, not on our servers. The numbers reflect their own home network, ISP and route.

**It says exactly what it measures.** Browsers can't send traditional "ping" packets or connect to game servers directly. So PingPilot times secure web requests to a cloud endpoint in the same city as each game's servers. That tracks in-game ping closely, and the app says so on screen rather than implying otherwise.

**No made-up numbers.** If a region can't be reached, it shows as *Unreachable*. The app never fills gaps with estimated or simulated values.

**It only advises.** PingPilot never changes DNS, firewall, router or system settings.

---

## What was delivered

| Area | Summary |
| --- | --- |
| **Login reliability** | Fixed the root cause of random logouts and "session not found" errors. The browser was signing in to an old database while the server checked a new one. Added Google sign-in and password reset. |
| **Game Ping Optimizer** | New screen built on real, in-browser measurements that replace the old simulated results. Covers 5 games and 55 server regions. |
| **Suggestions** | Rules-based advice from each player's history. No API keys or paid services required. |
| **New screens** | Dashboard, History, Settings and Admin, all on real data. The old demo-data pages were removed. |
| **Data privacy** | Each player can only ever see their own data, enforced by the database itself (Row Level Security on every table). Previously, all users shared one history table. |
| **Security** | Every page and API checks the login on the server. Every input is validated. Security headers (CSP, clickjacking protection, HSTS) are set, and APIs are rate limited. |
| **Reliability** | Automated checks (lint, type-check, 94 tests, production build) run on every change via GitHub Actions. Includes structured server logs and optional Sentry error monitoring. |
| **Documentation** | This README plus guides for [auth](docs/AUTH.md), [the optimizer](docs/OPTIMIZER.md), [suggestions](docs/SUGGESTIONS.md) and [security](docs/SECURITY.md). |

## Known limitations

- **Close to in-game ping, not identical.** Expect a few milliseconds of difference, more for regions marked *nearby* (tested from the closest available city).
- **Valorant is "coming soon".** Its routing network makes city-based measurement unreliable, so we chose not to show numbers that could mislead.
- **Server locations** come from public information and should be reviewed periodically ([`lib/games/catalog.ts`](lib/games/catalog.ts)).
- **Game logos** are colored initials for now. Official logos need properly licensed assets.
- **Email notifications** can be switched on in Settings, but emails aren't sent yet. The preferences are stored for when that launches.
- **Account deletion** is handled via support for now.

---

## For developers

### Tech stack
Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth + Postgres with RLS) via `@supabase/ssr` · Recharts · zod · Sentry · Vitest · GitHub Actions · Vercel

> Next.js 16 differs from older versions (e.g. `middleware.ts` → `proxy.ts`). Read `node_modules/next/dist/docs/` before changing framework-level code. See `AGENTS.md`.

### Getting started

Requirements: Node.js 22+ (see `.nvmrc`) and a Supabase project.

```bash
npm ci
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

One-time setup:

1. **Apply the database migrations** in `supabase/migrations/`, in filename order. Either use the CLI (`supabase link --project-ref <ref>` then `supabase db push`), or paste each file into the Supabase SQL editor. They're safe to re-run.
2. **Configure Supabase Auth**: redirect URLs and the Google provider. See [docs/AUTH.md](docs/AUTH.md#supabase-dashboard-configuration-manual-one-time).
3. *(Optional)* **Make yourself an admin**, then sign out and back in:
   ```sql
   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';
   ```

### Environment variables

| Variable | Required | Visible to browser | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | yes | Supabase publishable (anon-level) key |
| `NEXT_PUBLIC_SENTRY_DSN` | no | yes | Browser error reporting |
| `SENTRY_DSN` | no | no | Server error reporting |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | no | no (build only) | Source-map upload during `next build` |

`NEXT_PUBLIC_*` values are baked in at **build time**, so redeploy after changing them. **No service-role key is used anywhere.** All database access runs as the signed-in user, under Row Level Security.

**Design preview (development only):** with `npm run dev` running, open `/dev/preview/dashboard`, `dashboard-empty`, `optimizer`, `history`, `settings` or `admin` to see the signed-in screens with sample data (`lib/dev/fixtures.ts`), without an account. These routes return 404 in production builds.

### Scripts

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` · `npm run test:watch` · `npm run test:coverage` | Vitest |

### Architecture

```
Browser                                   Next.js on Vercel                          Supabase
───────                                   ─────────────────                          ────────
optimizer probe ──HTTPS──▶ AWS regional /ping endpoints (timing only)
      │ raw samples
      ▼
POST /api/ping-runs ─────────────────▶ proxy.ts (session refresh, 401/redirect)
                                        route: auth → rate limit → zod → recompute stats ──▶ ping_runs / ping_results (RLS)
GET /api/suggestions ────────────────▶ route: auth → features from history → rules ─────▶ ping_runs (RLS)
Server components (dashboard, history, settings, admin) ── user's session ─────────────▶ tables (RLS) / admin_usage_stats()
Errors ── /monitoring tunnel ──▶ Sentry
```

| Path | Contents |
| --- | --- |
| `proxy.ts` | Session refresh and route protection (runs before every request) |
| `app/` | Pages and route handlers (`app/api/*`, `app/auth/*`) |
| `components/` | UI: `optimizer/`, `charts/`, `suggestions/`, `history/`, `settings/`, `admin/`, `auth/`, `games/`, `shared/`, `ui/` |
| `lib/supabase/` | Browser, server and proxy Supabase clients |
| `lib/auth.ts` | `requirePageUser`, `authenticateRoute`, `isAdmin` |
| `lib/games/catalog.ts` | Games, regions and probe endpoints (data only; edit here to add a game) |
| `lib/latency/` | Browser probe, pure stats (shared client/server), zod schemas, run service |
| `lib/suggestions/` | Feature extraction from history + the rules engine |
| `lib/rate-limit.ts`, `lib/logger.ts` | Postgres-backed rate limits, structured JSON logs (+ Sentry) |
| `supabase/migrations/` | Schema, RLS policies, SQL functions |
| `tests/` | Vitest unit and route-handler tests |

Guides: [AUTH](docs/AUTH.md) · [OPTIMIZER](docs/OPTIMIZER.md) · [SUGGESTIONS](docs/SUGGESTIONS.md) · [SECURITY](docs/SECURITY.md)

### CI/CD

- **CI** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`: lint → type-check → tests with coverage → production build. It needs no secrets.
- **Deploys:** Vercel's Git integration builds a preview for every PR and deploys `main` to production. Set the env vars above in Vercel for both *Production* and *Preview*.
- Recommended: protect `main` in GitHub and require the **CI** check to pass before merging.
