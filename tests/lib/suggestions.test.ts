import { describe, expect, it } from "vitest";
import { buildFeatures, isValidTimeZone, timeBucket } from "@/lib/suggestions/features";
import { ruleBasedSuggestions } from "@/lib/suggestions/rules";
import { makeRun } from "../helpers/runs";

describe("timeBucket", () => {
  it("uses the user's time zone", () => {
    const date = new Date("2026-09-30T12:00:00Z");
    expect(timeBucket(date, "UTC")).toBe("afternoon");
    expect(timeBucket(date, "Asia/Manila")).toBe("evening"); // 20:00 local
    expect(timeBucket(date, "America/Los_Angeles")).toBe("night"); // 05:00 local
  });

  it("falls back to UTC for an invalid zone", () => {
    expect(timeBucket(new Date("2026-09-30T03:00:00Z"), "Not/AZone")).toBe("night");
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("Europe/Berlin")).toBe(true);
  });
});

describe("buildFeatures", () => {
  // Evenings (19:00 UTC) are jittery, mornings (08:00 UTC) are calm.
  const runs = [
    makeRun("2026-09-20T08:00:00Z", { sea: [40, 41, 40, 42], japan: [80, 81, 80, 80] }),
    makeRun("2026-09-21T08:00:00Z", { sea: [41, 40, 41, 40], japan: [82, 80, 81, 80] }),
    makeRun("2026-09-22T19:00:00Z", { sea: [40, 70, 35, 75], japan: [80, 110, 85, 120] }),
    makeRun("2026-09-23T19:00:00Z", { sea: [45, 80, 40, 85], japan: [82, 120, 80, 125] }),
  ];
  const features = buildFeatures(runs, "UTC", 30);

  it("aggregates per game and region, best first", () => {
    expect(features.runCount).toBe(4);
    expect(features.games).toHaveLength(1);
    expect(features.games[0].gameName).toBe("Dota 2");
    expect(features.games[0].regions.map((region) => region.targetId)).toEqual(["sea", "japan"]);
    expect(features.games[0].regions[0]).toMatchObject({ tests: 4, timesRecommended: 4 });
  });

  it("computes time-of-day buckets from each run's best region", () => {
    const morning = features.timeOfDay.find((bucket) => bucket.bucket === "morning")!;
    const evening = features.timeOfDay.find((bucket) => bucket.bucket === "evening")!;
    expect(morning.tests).toBe(2);
    expect(evening.avgJitterMs).toBeGreaterThan(morning.avgJitterMs * 5);
  });

  it("feeds rule-based suggestions: best region + evening congestion", () => {
    const set = ruleBasedSuggestions(features);
    expect(set.suggestions[0]).toMatchObject({ category: "region", title: "Play Dota 2 on SEA" });
    expect(set.suggestions.some((suggestion) => suggestion.category === "time-of-day" && /evening/.test(suggestion.title))).toBe(true);
    expect(set.suggestions.length).toBeLessThanOrEqual(4);
  });

  it("says so when there is no data", () => {
    const set = ruleBasedSuggestions(buildFeatures([], "UTC", 30));
    expect(set.dataQuality).toBe("insufficient");
    expect(set.suggestions).toEqual([]);
  });

  it("flags failing requests and worsening trends", () => {
    const degrading = [
      makeRun("2026-09-01T10:00:00Z", { sea: [40, 40, 40, 40] }),
      makeRun("2026-09-02T10:00:00Z", { sea: [40, 41, 40, 40] }),
      makeRun("2026-09-03T10:00:00Z", { sea: [70, null, 70, 71] }),
      makeRun("2026-09-04T10:00:00Z", { sea: [72, 70, null, 70] }),
    ];
    const set = ruleBasedSuggestions(buildFeatures(degrading, "UTC", 30));
    const categories = set.suggestions.map((suggestion) => suggestion.category);
    expect(categories).toContain("stability");
    expect(set.suggestions.some((suggestion) => /increased/.test(suggestion.title))).toBe(true);
  });
});

describe("expanded rules", () => {
  const titles = (runs: Parameters<typeof buildFeatures>[0], now?: number) =>
    ruleBasedSuggestions(buildFeatures(runs, "UTC", 30, now)).suggestions.map((suggestion) => suggestion.title);

  it("says a region is consistently faster when the gap is real", () => {
    const runs = [1, 2, 3].map((day) => makeRun(`2026-09-2${day}T10:00:00Z`, { sea: [40, 41, 40], hk: [80, 81, 80] }));
    const [first] = ruleBasedSuggestions(buildFeatures(runs, "UTC", 30)).suggestions;
    expect(first.detail).toMatch(/consistently about 40 ms faster/);
  });

  it("calls near-identical regions a tie instead of recommending a switch", () => {
    const runs = [makeRun("2026-09-21T10:00:00Z", { sea: [40, 40, 40], hk: [43, 43, 43] })];
    const [first] = ruleBasedSuggestions(buildFeatures(runs, "UTC", 30)).suggestions;
    expect(first.detail).toMatch(/within 3 ms/);
  });

  it("flags lag spikes (slow outliers far above the median)", () => {
    const runs = [
      makeRun("2026-09-21T10:00:00Z", { sea: [40, 40, 40, 40, 40, 40, 40, 40, 40, 150] }),
      makeRun("2026-09-22T10:00:00Z", { sea: [41, 40, 40, 40, 40, 40, 40, 40, 40, 160] }),
    ];
    expect(titles(runs)).toContain("You get occasional lag spikes");
  });

  it("notes when every region is far away", () => {
    expect(titles([makeRun("2026-09-21T10:00:00Z", { sea: [180, 181, 180] })])).toContain("All Dota 2 regions are far from you");
  });

  it("compares connection types when the browser reports them", () => {
    const runs = [
      makeRun("2026-09-21T10:00:00Z", { sea: [40, 41, 40] }, { connectionType: "ethernet" }),
      makeRun("2026-09-22T10:00:00Z", { sea: [40, 40, 41] }, { connectionType: "ethernet" }),
      makeRun("2026-09-23T10:00:00Z", { sea: [40, 60, 35, 65] }, { connectionType: "wifi" }),
      makeRun("2026-09-24T10:00:00Z", { sea: [42, 70, 38, 66] }, { connectionType: "wifi" }),
    ];
    expect(titles(runs)).toContain("Your connection is steadier on ethernet");
  });

  it("asks for a fresh test when the data is old", () => {
    const now = new Date("2026-10-15T00:00:00Z").getTime();
    expect(titles([makeRun("2026-09-21T10:00:00Z", { sea: [40, 41, 40] })], now)).toContain("Run a fresh test");
  });

  it("returns at most 4 suggestions, high priority first", () => {
    const runs = [
      makeRun("2026-09-01T08:00:00Z", { sea: [150, null, 150, 300] }),
      makeRun("2026-09-02T19:00:00Z", { sea: [150, 190, 140, 320] }),
      makeRun("2026-09-03T08:00:00Z", { sea: [190, null, 185, 350] }),
      makeRun("2026-09-04T19:00:00Z", { sea: [185, 230, 180, 360] }),
    ];
    const { suggestions } = ruleBasedSuggestions(buildFeatures(runs, "UTC", 30));
    expect(suggestions.length).toBe(4);
    const order = { high: 0, medium: 1, low: 2 };
    expect(suggestions.map((suggestion) => order[suggestion.priority])).toEqual([...suggestions.map((suggestion) => order[suggestion.priority])].sort());
  });
});
