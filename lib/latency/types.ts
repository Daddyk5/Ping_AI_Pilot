import type { CUSTOM_TARGET_ID, GameId } from "@/lib/games/catalog";
import type { LatencyStats, Quality, Sample } from "@/lib/latency/stats";

export const MEASUREMENT_METHOD = "browser-http-rtt" as const;

export type PingResultDto = {
  targetId: string;
  targetLabel: string;
  endpointHost: string;
  samples: Sample[];
  stats: LatencyStats;
  score: number | null;
  quality: Quality;
};

export type PingRunDto = {
  id: string;
  gameId: GameId | typeof CUSTOM_TARGET_ID;
  method: typeof MEASUREMENT_METHOD;
  samplesPerTarget: number;
  recommendedTargetId: string | null;
  connectionType: string | null;
  createdAt: string;
  /** Best-first. */
  results: PingResultDto[];
};
