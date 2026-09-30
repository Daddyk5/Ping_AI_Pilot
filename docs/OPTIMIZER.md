# Game Ping Optimizer

`/optimizer` tests a game's server regions from the user's own connection, recommends the best one, and saves every run so users can track connection quality over time.

## What is measured, and why

| Option | Why not |
| --- | --- |
| ICMP ping | Browsers can't send ICMP. Serverless functions (Vercel) can't either. |
| Ping from our server | Measures Vercel → game server, not the **user's** connection. Useless for the user. |
| Direct to game servers | Game servers use UDP or custom protocols, not HTTPS, and their IPs aren't stable or published. |
| **HTTPS round-trip time from the browser to a cloud endpoint in the same city** ✅ | Measures the user's real path to that city. |

**Probe endpoints:** `https://dynamodb.<aws-region>.amazonaws.com/ping`. These are AWS's public health-check endpoints (the same ones cloudping.info uses). They're tiny, fast, free, keep connections alive, and cover about 25 cities. Bahrain (`me-south-1`) is excluded because it didn't respond when tested on 2026-09-30.

**Algorithm** (`lib/latency/probe.ts`)
1. One warm-up request, discarded. It pays for DNS, TCP and the TLS handshake. A cold request measured about 690 ms against about 230 ms warm.
2. 10 timed `no-cors` requests over the kept-alive connection, 60 ms apart, 2 s timeout each. Each response body is drained outside the timed window so the connection is released for reuse. Without this, requests intermittently opened new connections and inflated jitter about 10×.
3. Regions are tested one at a time, not in parallel, so they don't compete for bandwidth.

On a warm connection, time-to-headers ≈ one network round trip + a few ms of server and browser overhead. Numbers usually read slightly higher than in-game ping. The UI says this in plain language (`components/optimizer/MethodNotice.tsx`). Keep that notice honest if the method changes.

**Failed requests** are timeouts or errors. They're shown as "failed requests", never as "packet loss". HTTP runs over TCP, so real packet loss shows up as retransmission delay, not as a failed request.

## Statistics (`lib/latency/stats.ts`)

- median, mean, min, max, p95 (linear interpolation)
- **jitter** = mean absolute difference between consecutive successful samples
- **score** (lower is better) = `median + 2 × jitter + 500 × failureRate`
- **grade**: excellent (<50 ms, jitter <10, no failures) · good (<80, <20, <5%) · fair (<130, <30, <10%) · poor · unreachable
- **recommendation** = lowest score. If the runner-up is within 5 points, the UI calls it a tie.

The same pure functions run in the browser (live display) and on the server. **The server is the source of truth:** the client posts raw samples only, and `POST /api/ping-runs` validates them (zod, `lib/latency/schema.ts`), resolves labels and hosts from the catalog (never from the client), then recomputes everything.

## Games (`lib/games/catalog.ts`)

Dota 2, MLBB, Delta Force, CS2, League of Legends, and Valorant (**coming soon**: it uses Riot Direct routing, so a city proxy can't predict in-game ping reliably), plus **Custom** (any HTTPS host).

Each region maps to a probe site. `proximity: "nearby"` means there's no AWS region in the game's server city (e.g. Dota 2 EU West is in Luxembourg, tested via Frankfurt), and the UI labels it. **Server locations come from public information. Review them periodically.**

Logos are monogram badges for now. See `public/games/README.md`.

## Storage

`ping_runs` (one per test) → `ping_results` (one per region, including the raw `samples real[]` with NULL for failures). Both tables have RLS: users can only select, insert and delete their own rows, and a result can only be attached to the user's own run. Migration: `supabase/migrations/202609300002_ping_runs.sql`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/ping-runs` | `{ gameId, connectionType?, targets: [{ targetId, customHost?, samples: (number\|null)[] }] }` → `{ run }`. Max 64 KB, 40 targets, 30 samples each. |
| GET | `/api/ping-runs?gameId=&targetId=&from=&to=&limit=` | Newest first, max 200. |
| DELETE | `/api/ping-runs` | Deletes all of the user's runs. |

## Adding a game or region

1. Add or edit the entry in `GAMES` in `lib/games/catalog.ts`. If you need a new city, add it to `PROBE_SITES` (check that `curl https://dynamodb.<region>.amazonaws.com/ping` returns `healthy`).
2. `npm test` checks catalog integrity (unique region ids, valid probe sites).
