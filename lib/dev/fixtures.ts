// Sample data for the development-only design preview (/dev/preview). Never used in production:
// both /dev routes return 404 when NODE_ENV === "production".

import { getGame, PROBE_SITES, probeHost } from "@/lib/games/catalog";
import { computeStats, gradeStats, scoreStats, type Sample } from "@/lib/latency/stats";
import type { PingRunDto } from "@/lib/latency/types";
import type { SuggestionsDto } from "@/lib/suggestions/schema";

export const isDesignPreviewEnabled = () => process.env.NODE_ENV !== "production";

// Deterministic pseudo-random so screenshots are stable between runs.
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const BASE_MS: Record<string, number> = { sea: 38, hk: 58, japan: 82, india: 96, australia: 118, "us-west": 168, "eu-west": 205 };

function run(id: number, hoursAgo: number, evening: boolean): PingRunDto {
  const random = seeded(id * 97 + 13);
  const game = getGame("dota2")!;
  const results = game.regions
    .filter((region) => region.id in BASE_MS)
    .map((region) => {
      const base = BASE_MS[region.id] + (evening ? 6 : 0);
      const samples: Sample[] = Array.from({ length: 10 }, () => {
        if (random() < (region.id === "eu-west" ? 0.12 : 0.01)) return null;
        const spike = evening && random() < 0.15 ? 8 + random() * 12 : 0;
        return Math.round((base + random() * 6 + spike) * 10) / 10;
      });
      const stats = computeStats(samples);
      return {
        targetId: region.id,
        targetLabel: region.name,
        endpointHost: probeHost(PROBE_SITES[region.probe]),
        samples,
        stats,
        score: scoreStats(stats),
        quality: gradeStats(stats),
      };
    })
    .sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity));

  return {
    id: `fixture-${id}`,
    gameId: "dota2",
    method: "browser-http-rtt",
    samplesPerTarget: 10,
    recommendedTargetId: results[0]?.targetId ?? null,
    connectionType: id % 3 === 0 ? "wifi" : null,
    createdAt: new Date(Date.UTC(2026, 8, 30, 12) - hoursAgo * 3_600_000).toISOString(),
    results,
  };
}

/** 14 runs over ~12 days, newest first, alternating morning/evening. */
export function fixtureRuns(): PingRunDto[] {
  return Array.from({ length: 14 }, (_, index) => run(index + 1, index * 21, index % 2 === 1));
}

export function fixtureSuggestions(scope = "overview"): SuggestionsDto {
  return {
    scope,
    generatedAt: new Date(Date.UTC(2026, 8, 30, 12)).toISOString(),
    basedOnRuns: 14,
    headline: "Your best Dota 2 route is SE Asia at a typical 41 ms.",
    dataQuality: "good",
    suggestions: [
      {
        category: "region",
        priority: "high",
        title: "Play Dota 2 on SE Asia",
        detail: "SE Asia has been consistently about 20 ms faster for you than Hong Kong. Set it as your default region.",
        evidence: "Typical 41 ms over 14 tests; next best Hong Kong 61 ms.",
      },
      {
        category: "time-of-day",
        priority: "medium",
        title: "Your connection is less stable in the evening",
        detail: "Jitter spikes in the evening, which usually means congestion on your home network or at your ISP. Use a wired connection and pause downloads before playing.",
        evidence: "Evening jitter 14 ms vs 3 ms in the afternoon.",
      },
      {
        category: "stability",
        priority: "medium",
        title: "You get occasional lag spikes",
        detail: "Most requests are fast, but some are much slower. Pause cloud backups, game updates or video calls while playing.",
        evidence: "Slowest requests to SE Asia run about 34 ms above your typical 41 ms.",
      },
    ],
  };
}

export const fixtureAdminStats = {
  generatedAt: new Date(Date.UTC(2026, 8, 30, 12)).toISOString(),
  users: { total: 1284, new7d: 96, new30d: 402, active7d: 311, active30d: 780 },
  runs: { total: 18452, last30d: 6210 },
  runs7d: 1650,
  runsPerDay: Array.from({ length: 30 }, (_, index) => ({
    day: new Date(Date.UTC(2026, 8, 1 + index)).toISOString().slice(0, 10),
    runs: Math.round(140 + index * 4 + Math.sin(index / 1.3) * 40),
  })),
  runsByGame: [
    { gameId: "mlbb", runs: 2480 },
    { gameId: "dota2", runs: 1710 },
    { gameId: "cs2", runs: 980 },
    { gameId: "lol", runs: 640 },
    { gameId: "deltaforce", runs: 400 },
  ],
};
