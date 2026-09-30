# Suggestions

Plain-language advice generated from a user's test history. It appears on the dashboard (`scope=overview`, all games) and in the optimizer (`scope=<gameId>`).

It's a **deterministic rules engine**: no AI model, no API keys, no per-request cost. Every suggestion cites the numbers behind it, so users can check it. (An LLM-based version was built and then removed at the project owner's request on 2026-10-01 in favour of rules only. The features below would be a good input if an LLM is ever added back.)

## Flow

`SuggestionsCard` → `GET /api/suggestions?scope=…&timeZone=…` → `lib/suggestions/service.ts`

1. Load the user's runs from the last 30 days (RLS-scoped).
2. **`buildFeatures()`** (`lib/suggestions/features.ts`) summarises them. Per game and region: typical, best and worst latency, jitter, failure %, spikes (p95 − median), and trend (second half vs first half of the window). It also buckets the best route by time of day in the user's time zone, groups by browser-reported connection type, and records days since the last test.
3. **`ruleBasedSuggestions()`** (`lib/suggestions/rules.ts`) runs each rule, sorts the results high → medium → low priority, and keeps the top 4.

The card refetches when a new test is saved.

## Rules

| Rule | Fires when | Suggestion |
| --- | --- | --- |
| Best region | always (per game) | Play on X; "consistently N ms faster than Y" when the gap is real; a tie when within 5 ms |
| Failures | ≥ 2% of requests to the best region fail | Unstable link: go wired or move closer to the router |
| Time of day | one part of the day has ≥ 2× the jitter (≥ 8 ms), or ≥ 20 ms higher latency | Peak-hour congestion: go wired, pause other traffic, play at other times |
| Lag spikes | p95 is ≥ 30 ms above the median on average | Pause backups, updates and calls while playing |
| Trend | best region is ≥ 15 ms slower than earlier in the window | Restart router; re-compare regions; contact ISP |
| Distance | best region is ≥ 120 ms | Servers are far; distance sets a floor |
| Connection type | two reported types differ by ≥ 5 ms jitter | Prefer the steadier one |
| Data | last test ≥ 7 days ago, or thin data | Run a fresh test / test at different times |

Rules never recommend changing DNS, router firmware or system network settings, and they never promise a fix, in line with the app's observer-only stance. Differences under `NOISE_MS` (5 ms) are treated as noise.

## Adding a rule

Write a function `(features) => Suggestion | Suggestion[] | null` in `lib/suggestions/rules.ts`, add it to `RULES`, and add a test to `tests/lib/suggestions.test.ts`. If it needs a new number, compute it in `buildFeatures()`.
