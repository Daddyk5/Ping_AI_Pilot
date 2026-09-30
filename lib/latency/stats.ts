// Pure latency statistics. Used by the browser for live display and by the server as the
// source of truth (the server recomputes everything from raw samples; client stats are never trusted).

/** A sample is an RTT in milliseconds, or null for a failed / timed-out request. */
export type Sample = number | null;

export type LatencyStats = {
  count: number;
  received: number;
  failed: number;
  /** 0..1 share of requests that failed or timed out. NOT packet loss (see docs). */
  failureRate: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  p95: number | null;
  /** Mean absolute difference between consecutive successful samples. */
  jitter: number | null;
};

export type Quality = "excellent" | "good" | "fair" | "poor" | "unreachable";

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Linear-interpolated percentile of an ascending-sorted array (p in 0..1). */
export function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function computeStats(samples: Sample[]): LatencyStats {
  const values = samples.filter((sample): sample is number => sample !== null && Number.isFinite(sample));
  const sorted = [...values].sort((a, b) => a - b);
  const count = samples.length;
  const received = values.length;
  const failed = count - received;

  let jitter: number | null = null;
  if (values.length >= 2) {
    let total = 0;
    for (let i = 1; i < values.length; i++) {
      total += Math.abs(values[i] - values[i - 1]);
    }
    jitter = round1(total / (values.length - 1));
  } else if (values.length === 1) {
    jitter = 0;
  }

  const mean = received ? values.reduce((sum, value) => sum + value, 0) / received : null;
  const median = percentile(sorted, 0.5);
  const p95 = percentile(sorted, 0.95);

  return {
    count,
    received,
    failed,
    failureRate: count ? Math.round((failed / count) * 1000) / 1000 : 0,
    min: received ? round1(sorted[0]) : null,
    max: received ? round1(sorted[sorted.length - 1]) : null,
    mean: mean === null ? null : round1(mean),
    median: median === null ? null : round1(median),
    p95: p95 === null ? null : round1(p95),
    jitter,
  };
}

/**
 * Lower is better. Median latency, plus jitter weighted x2 (spikes hurt more than a steady
 * few ms), plus 5ms per percentage point of failed requests. Null when unreachable.
 */
export function scoreStats(stats: LatencyStats) {
  if (stats.median === null || stats.received === 0) return null;
  return round1(stats.median + 2 * (stats.jitter ?? 0) + stats.failureRate * 500);
}

export function gradeStats(stats: LatencyStats): Quality {
  if (stats.median === null) return "unreachable";
  const jitter = stats.jitter ?? 0;
  if (stats.median < 50 && jitter < 10 && stats.failureRate === 0) return "excellent";
  if (stats.median < 80 && jitter < 20 && stats.failureRate < 0.05) return "good";
  if (stats.median < 130 && jitter < 30 && stats.failureRate < 0.1) return "fair";
  return "poor";
}

export type RankedTarget<T> = T & { stats: LatencyStats; score: number | null; quality: Quality };

/** Scores and sorts targets best-first; unreachable targets sink to the bottom. */
export function rankTargets<T extends { samples: Sample[] }>(targets: T[]): RankedTarget<T>[] {
  return targets
    .map((target) => {
      const stats = computeStats(target.samples);
      return { ...target, stats, score: scoreStats(stats), quality: gradeStats(stats) };
    })
    .sort((a, b) => {
      if (a.score === null) return b.score === null ? 0 : 1;
      if (b.score === null) return -1;
      return a.score - b.score;
    });
}

/** Within this many score points, two regions are treated as effectively tied. */
export const TIE_THRESHOLD = 5;

export function pickRecommendation<T>(ranked: RankedTarget<T>[]) {
  const [best, runnerUp] = ranked;
  if (!best || best.score === null) return null;
  const isTie = runnerUp?.score != null && runnerUp.score - best.score <= TIE_THRESHOLD;
  return { best, runnerUp: runnerUp?.score != null ? runnerUp : null, isTie };
}
