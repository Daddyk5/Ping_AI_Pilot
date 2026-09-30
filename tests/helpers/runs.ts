import { computeStats, gradeStats, scoreStats, type Sample } from "@/lib/latency/stats";
import type { PingRunDto } from "@/lib/latency/types";

/** Builds a PingRunDto the same way the server would, from raw samples per target. */
export function makeRun(createdAt: string, targets: Record<string, Sample[]>, options: { gameId?: string; connectionType?: string } = {}): PingRunDto {
  const results = Object.entries(targets)
    .map(([targetId, samples]) => {
      const stats = computeStats(samples);
      return { targetId, targetLabel: targetId.toUpperCase(), endpointHost: "example", samples, stats, score: scoreStats(stats), quality: gradeStats(stats) };
    })
    .sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity));

  return {
    id: `run-${createdAt}`,
    gameId: (options.gameId ?? "dota2") as PingRunDto["gameId"],
    method: "browser-http-rtt",
    samplesPerTarget: 5,
    recommendedTargetId: results[0]?.score != null ? results[0].targetId : null,
    connectionType: options.connectionType ?? null,
    createdAt,
    results,
  };
}
