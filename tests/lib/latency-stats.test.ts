import { describe, expect, it } from "vitest";
import { computeStats, gradeStats, percentile, pickRecommendation, rankTargets, scoreStats } from "@/lib/latency/stats";

describe("percentile", () => {
  it("interpolates linearly", () => {
    expect(percentile([10, 20, 30, 40], 0.5)).toBe(25);
    expect(percentile([10, 20, 30, 40, 50], 0.95)).toBeCloseTo(48);
  });

  it("handles tiny inputs", () => {
    expect(percentile([], 0.5)).toBeNull();
    expect(percentile([7], 0.95)).toBe(7);
  });
});

describe("computeStats", () => {
  it("computes the full set of stats", () => {
    const stats = computeStats([30, 34, 31, 40, 35]);
    expect(stats).toMatchObject({ count: 5, received: 5, failed: 0, failureRate: 0, min: 30, max: 40, median: 34, mean: 34 });
    // |34-30| + |31-34| + |40-31| + |35-40| = 4+3+9+5 = 21 / 4
    expect(stats.jitter).toBe(5.3);
  });

  it("treats null samples as failures and excludes them from latency stats", () => {
    const stats = computeStats([20, null, 22, null]);
    expect(stats).toMatchObject({ count: 4, received: 2, failed: 2, failureRate: 0.5, median: 21, jitter: 2 });
  });

  it("returns nulls when everything failed", () => {
    const stats = computeStats([null, null]);
    expect(stats).toMatchObject({ received: 0, failureRate: 1, median: null, jitter: null });
    expect(scoreStats(stats)).toBeNull();
    expect(gradeStats(stats)).toBe("unreachable");
  });

  it("jitter is 0 for a single sample", () => {
    expect(computeStats([50]).jitter).toBe(0);
  });
});

describe("scoring and grading", () => {
  it("penalises jitter and failures", () => {
    expect(scoreStats(computeStats([40, 40, 40]))).toBe(40);
    // median 40, jitter 10 -> 40 + 20
    expect(scoreStats(computeStats([30, 40, 50]))).toBe(60);
    // 1 of 4 failed: +0.25*500 = 125
    expect(scoreStats(computeStats([40, 40, 40, null]))).toBe(165);
  });

  it.each([
    [[20, 22, 21], "excellent"],
    [[60, 65, 62], "good"],
    [[110, 115, 112], "fair"],
    [[250, 260, 255], "poor"],
  ] as const)("%j -> %s", (samples, grade) => {
    expect(gradeStats(computeStats([...samples]))).toBe(grade);
  });
});

describe("rankTargets / pickRecommendation", () => {
  const targets = [
    { id: "far", samples: [180, 182, 181] },
    { id: "dead", samples: [null, null] },
    { id: "near-jittery", samples: [30, 70, 30, 70] },
    { id: "near-steady", samples: [45, 46, 45, 46] },
  ];

  it("ranks by score, unreachable last", () => {
    expect(rankTargets(targets).map((target) => target.id)).toEqual(["near-steady", "near-jittery", "far", "dead"]);
  });

  it("recommends the best and flags near-ties", () => {
    const recommendation = pickRecommendation(rankTargets(targets));
    expect(recommendation?.best.id).toBe("near-steady");
    expect(recommendation?.isTie).toBe(false);

    const tied = pickRecommendation(rankTargets([{ id: "a", samples: [40, 40] }, { id: "b", samples: [43, 43] }]));
    expect(tied?.isTie).toBe(true);
  });

  it("recommends nothing when nothing responded", () => {
    expect(pickRecommendation(rankTargets([{ id: "x", samples: [null] }]))).toBeNull();
  });
});
