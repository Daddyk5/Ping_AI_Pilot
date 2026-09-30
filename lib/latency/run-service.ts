import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { CUSTOM_TARGET_ID, getGame, getRegion, normalizeCustomHost, PROBE_SITES, probeHost, type GameId } from "@/lib/games/catalog";
import type { PingRunInput, PingRunQuery } from "@/lib/latency/schema";
import { gradeStats, rankTargets, type Sample } from "@/lib/latency/stats";
import { MEASUREMENT_METHOD, type PingResultDto, type PingRunDto } from "@/lib/latency/types";

// All queries use the signed-in user's Supabase client, so RLS enforces ownership.

type ResultRow = {
  run_id: string;
  target_id: string;
  target_label: string;
  endpoint_host: string;
  samples: Sample[];
  received: number;
  failed: number;
  failure_rate: number;
  min_ms: number | null;
  median_ms: number | null;
  mean_ms: number | null;
  p95_ms: number | null;
  max_ms: number | null;
  jitter_ms: number | null;
  score: number | null;
  created_at: string;
};

type RunRow = {
  id: string;
  game_id: GameId | typeof CUSTOM_TARGET_ID;
  samples_per_target: number;
  recommended_target_id: string | null;
  connection_type: string | null;
  created_at: string;
  ping_results?: ResultRow[];
};

/** Resolves labels/hosts from the catalog (never from the client) and computes stats. */
export function buildRunResults(input: PingRunInput) {
  const game = getGame(input.gameId) ?? null; // null for a standalone custom-host run

  const targets = input.targets.map((target) => {
    if (target.targetId === CUSTOM_TARGET_ID) {
      const host = normalizeCustomHost(target.customHost ?? "");
      if (!host) throw new Error("Invalid custom host.");
      return { targetId: CUSTOM_TARGET_ID, targetLabel: `Custom: ${host}`, endpointHost: host, samples: target.samples };
    }

    const region = game ? getRegion(game, target.targetId) : undefined;
    if (!region) throw new Error("Unknown region.");
    return {
      targetId: region.id,
      targetLabel: region.name,
      endpointHost: probeHost(PROBE_SITES[region.probe]),
      samples: target.samples,
    };
  });

  const ranked = rankTargets(targets);
  // A custom host is never "recommended" over a game region, but a custom-only run can recommend it.
  const recommended =
    ranked.find((target) => target.score !== null && target.targetId !== CUSTOM_TARGET_ID) ??
    (game ? null : (ranked.find((target) => target.score !== null) ?? null));

  return { game, ranked, recommendedTargetId: recommended?.targetId ?? null };
}

function toResultDto(row: ResultRow): PingResultDto {
  const stats = {
    count: row.samples.length,
    received: row.received,
    failed: row.failed,
    failureRate: row.failure_rate,
    min: row.min_ms,
    max: row.max_ms,
    mean: row.mean_ms,
    median: row.median_ms,
    p95: row.p95_ms,
    jitter: row.jitter_ms,
  };
  return {
    targetId: row.target_id,
    targetLabel: row.target_label,
    endpointHost: row.endpoint_host,
    samples: row.samples,
    stats,
    score: row.score,
    quality: gradeStats(stats),
  };
}

function toRunDto(row: RunRow): PingRunDto {
  const results = (row.ping_results ?? []).map(toResultDto).sort((a, b) => {
    if (a.score === null) return b.score === null ? 0 : 1;
    if (b.score === null) return -1;
    return a.score - b.score;
  });

  return {
    id: row.id,
    gameId: row.game_id,
    method: MEASUREMENT_METHOD,
    samplesPerTarget: row.samples_per_target,
    recommendedTargetId: row.recommended_target_id,
    connectionType: row.connection_type,
    createdAt: row.created_at,
    results,
  };
}

export async function saveRun(supabase: SupabaseClient, userId: string, input: PingRunInput): Promise<PingRunDto> {
  const { ranked, recommendedTargetId } = buildRunResults(input);

  const { data: run, error: runError } = await supabase
    .from("ping_runs")
    .insert({
      user_id: userId,
      game_id: input.gameId,
      method: MEASUREMENT_METHOD,
      samples_per_target: Math.max(...input.targets.map((target) => target.samples.length)),
      recommended_target_id: recommendedTargetId,
      connection_type: input.connectionType ?? null,
    })
    .select("id, game_id, samples_per_target, recommended_target_id, connection_type, created_at")
    .single<RunRow>();

  if (runError || !run) throw new Error(runError?.message ?? "Could not save run.");

  const rows = ranked.map((target) => ({
    run_id: run.id,
    user_id: userId,
    game_id: input.gameId,
    target_id: target.targetId,
    target_label: target.targetLabel,
    endpoint_host: target.endpointHost,
    samples: target.samples,
    received: target.stats.received,
    failed: target.stats.failed,
    failure_rate: target.stats.failureRate,
    min_ms: target.stats.min,
    median_ms: target.stats.median,
    mean_ms: target.stats.mean,
    p95_ms: target.stats.p95,
    max_ms: target.stats.max,
    jitter_ms: target.stats.jitter,
    score: target.score,
  }));

  const { data: results, error: resultsError } = await supabase.from("ping_results").insert(rows).select("*");
  if (resultsError) {
    // No multi-statement transactions over PostgREST; remove the orphaned run instead.
    await supabase.from("ping_runs").delete().eq("id", run.id);
    throw new Error(resultsError.message);
  }

  return toRunDto({ ...run, ping_results: (results ?? []) as ResultRow[] });
}

export async function listRuns(supabase: SupabaseClient, userId: string, query: PingRunQuery): Promise<PingRunDto[]> {
  let request = supabase
    .from("ping_runs")
    .select("id, game_id, samples_per_target, recommended_target_id, connection_type, created_at, ping_results(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(query.limit);

  if (query.gameId) request = request.eq("game_id", query.gameId);
  if (query.from) request = request.gte("created_at", query.from);
  if (query.to) request = request.lte("created_at", query.to);

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  let runs = ((data ?? []) as RunRow[]).map(toRunDto);
  if (query.targetId) {
    runs = runs
      .map((run) => ({ ...run, results: run.results.filter((result) => result.targetId === query.targetId) }))
      .filter((run) => run.results.length > 0);
  }
  return runs;
}

export async function deleteRuns(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("ping_runs").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}
