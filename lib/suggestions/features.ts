// Turns a user's saved runs into a compact numeric summary that the suggestion rules read.
// Every suggestion cites numbers computed here.

import { CUSTOM_TARGET_ID, getGame } from "@/lib/games/catalog";
import { percentile } from "@/lib/latency/stats";
import type { PingRunDto } from "@/lib/latency/types";

export type TimeBucket = "morning" | "afternoon" | "evening" | "night";

export type RegionFeature = {
  targetId: string;
  label: string;
  tests: number;
  /** Median of per-test medians. */
  typicalMs: number;
  bestMs: number;
  worstMs: number;
  avgJitterMs: number;
  avgFailurePct: number;
  /** Average of (p95 − median) per test: how far the slow requests stick out. */
  avgSpikeMs: number;
  /** Change in typical latency, first half vs second half of the window (ms, + = worse). */
  trendMs: number | null;
  timesRecommended: number;
};

export type GameFeature = { gameId: string; gameName: string; runs: number; regions: RegionFeature[] };

export type BucketFeature = { bucket: TimeBucket; tests: number; typicalMs: number; avgJitterMs: number; avgFailurePct: number };

export type Features = {
  windowDays: number;
  runCount: number;
  firstRunAt: string | null;
  lastRunAt: string | null;
  timeZone: string;
  games: GameFeature[];
  /** Across all targets, jitter/latency grouped by the user's local time of day. */
  timeOfDay: BucketFeature[];
  /** Per connection type (browser-reported, often "unknown"): tests and jitter on the best route. */
  connections: Array<{ type: string; tests: number; avgJitterMs: number }>;
  daysSinceLastRun: number | null;
};

const round = (value: number) => Math.round(value * 10) / 10;
const median = (values: number[]) => percentile([...values].sort((a, b) => a - b), 0.5) ?? 0;
const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

export function timeBucket(date: Date, timeZone: string): TimeBucket {
  let hour: number;
  try {
    hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone }).format(date));
  } catch {
    hour = date.getUTCHours();
  }
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18) return "evening";
  return "night";
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function buildFeatures(runs: PingRunDto[], timeZone: string, windowDays: number, now = Date.now()): Features {
  const sorted = [...runs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const games = new Map<string, PingRunDto[]>();
  for (const run of sorted) {
    games.set(run.gameId, [...(games.get(run.gameId) ?? []), run]);
  }

  const gameFeatures: GameFeature[] = [...games.entries()].map(([gameId, gameRuns]) => {
    const byTarget = new Map<string, { label: string; points: Array<{ at: string; median: number; jitter: number; failure: number; spike: number }>; recommended: number }>();

    for (const run of gameRuns) {
      for (const result of run.results) {
        if (result.stats.median === null) continue;
        const entry = byTarget.get(result.targetId) ?? { label: result.targetLabel, points: [], recommended: 0 };
        entry.points.push({
          at: run.createdAt,
          median: result.stats.median,
          jitter: result.stats.jitter ?? 0,
          failure: result.stats.failureRate,
          spike: Math.max(0, (result.stats.p95 ?? result.stats.median) - result.stats.median),
        });
        if (run.recommendedTargetId === result.targetId) entry.recommended += 1;
        byTarget.set(result.targetId, entry);
      }
    }

    const regions: RegionFeature[] = [...byTarget.entries()]
      .map(([targetId, { label, points, recommended }]) => {
        const medians = points.map((point) => point.median);
        const half = Math.floor(points.length / 2);
        const trendMs = points.length >= 4 ? round(median(medians.slice(half)) - median(medians.slice(0, half))) : null;
        return {
          targetId,
          label,
          tests: points.length,
          typicalMs: round(median(medians)),
          bestMs: round(Math.min(...medians)),
          worstMs: round(Math.max(...medians)),
          avgJitterMs: round(mean(points.map((point) => point.jitter))),
          avgFailurePct: round(mean(points.map((point) => point.failure)) * 100),
          avgSpikeMs: round(mean(points.map((point) => point.spike))),
          trendMs,
          timesRecommended: recommended,
        };
      })
      .sort((a, b) => a.typicalMs - b.typicalMs)
      .slice(0, 8);

    return { gameId, gameName: gameId === CUSTOM_TARGET_ID ? "Custom hosts" : (getGame(gameId)?.name ?? gameId), runs: gameRuns.length, regions };
  });

  // Time of day: use each run's recommended (best) target so buckets compare like with like.
  const buckets = new Map<TimeBucket, Array<{ median: number; jitter: number; failure: number }>>();
  for (const run of sorted) {
    const best = run.results.find((result) => result.targetId === run.recommendedTargetId && result.stats.median !== null);
    if (!best) continue;
    const bucket = timeBucket(new Date(run.createdAt), timeZone);
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), { median: best.stats.median!, jitter: best.stats.jitter ?? 0, failure: best.stats.failureRate }]);
  }
  const order: TimeBucket[] = ["morning", "afternoon", "evening", "night"];
  const timeOfDay = order
    .filter((bucket) => buckets.has(bucket))
    .map((bucket) => {
      const points = buckets.get(bucket)!;
      return {
        bucket,
        tests: points.length,
        typicalMs: round(median(points.map((point) => point.median))),
        avgJitterMs: round(mean(points.map((point) => point.jitter))),
        avgFailurePct: round(mean(points.map((point) => point.failure)) * 100),
      };
    });

  const byConnection = new Map<string, number[]>();
  for (const run of sorted) {
    const best = run.results.find((result) => result.targetId === run.recommendedTargetId);
    if (!best) continue;
    const key = run.connectionType ?? "unknown";
    byConnection.set(key, [...(byConnection.get(key) ?? []), best.stats.jitter ?? 0]);
  }
  const connections = [...byConnection.entries()].map(([type, jitters]) => ({ type, tests: jitters.length, avgJitterMs: round(mean(jitters)) }));
  const lastRunAt = sorted.at(-1)?.createdAt ?? null;

  return {
    windowDays,
    runCount: sorted.length,
    firstRunAt: sorted[0]?.createdAt ?? null,
    lastRunAt,
    timeZone,
    games: gameFeatures,
    timeOfDay,
    connections,
    daysSinceLastRun: lastRunAt ? Math.floor((now - new Date(lastRunAt).getTime()) / 86_400_000) : null,
  };
}
