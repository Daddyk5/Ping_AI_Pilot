"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleStop, Loader2, Play, TriangleAlert } from "lucide-react";
import { SuggestionsCard } from "@/components/suggestions/SuggestionsCard";
import { LatencyTrendChart, type TrendPoint } from "@/components/charts/LatencyTrendChart";
import { RegionRankingChart } from "@/components/charts/RegionRankingChart";
import { SampleTimelineChart } from "@/components/charts/SampleTimelineChart";
import { GameBadge } from "@/components/games/GameBadge";
import { GamePicker, type PickerValue } from "@/components/optimizer/GamePicker";
import { MethodNotice } from "@/components/optimizer/MethodNotice";
import { RecommendationCard } from "@/components/optimizer/RecommendationCard";
import { ResultsTable, type TableRow } from "@/components/optimizer/ResultsTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CUSTOM_TARGET_ID, customTargetUrl, getGame, normalizeCustomHost, PROBE_SITES, probeUrl, type Game } from "@/lib/games/catalog";
import { DEFAULT_SAMPLES, getConnectionType, probeTarget } from "@/lib/latency/probe";
import { pickRecommendation, rankTargets, type Sample } from "@/lib/latency/stats";
import type { PingRunDto } from "@/lib/latency/types";

type Target = { targetId: string; label: string; location: string; nearby: boolean; url: string; customHost?: string };
type LiveState = Record<string, { samples: Sample[]; status: "pending" | "running" | "done" }>;
type Phase = "idle" | "running" | "saving" | "done";

function gameTargets(game: Game): Target[] {
  return game.regions.map((region) => {
    const site = PROBE_SITES[region.probe];
    return {
      targetId: region.id,
      label: region.name,
      location: region.proximity === "same-city" ? region.serverCity : `${region.serverCity} (tested via ${site.city})`,
      nearby: region.proximity === "nearby",
      url: probeUrl(site),
    };
  });
}

export function OptimizerExperience({ initialGame }: { initialGame?: string }) {
  const [pick, setPick] = useState<PickerValue>((initialGame as PickerValue | undefined) ?? "dota2");
  const game = pick === CUSTOM_TARGET_ID ? null : (getGame(pick) ?? null);
  const [disabledRegions, setDisabledRegions] = useState<Set<string>>(new Set());
  const [customInput, setCustomInput] = useState("");
  const [live, setLive] = useState<LiveState>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<PingRunDto[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const customHost = normalizeCustomHost(customInput);
  const allTargets = useMemo<Target[]>(() => {
    if (game) return gameTargets(game);
    if (!customHost) return [];
    return [{ targetId: CUSTOM_TARGET_ID, label: customHost, location: "Custom host", nearby: false, url: customTargetUrl(customHost), customHost }];
  }, [game, customHost]);
  const targets = allTargets.filter((target) => !disabledRegions.has(target.targetId));

  const loadHistory = useCallback(async (gameId: PickerValue) => {
    try {
      const response = await fetch(`/api/ping-runs?gameId=${gameId}&limit=100`, { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) setHistory(payload.runs as PingRunDto[]);
    } catch {
      // History is a nice-to-have on this screen; the optimizer still works without it.
    }
  }, []);

  useEffect(() => {
    // Fetching on game change is the point of this effect; the results land asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHistory(pick);
  }, [pick, loadHistory]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function changeGame(next: PickerValue) {
    setPick(next);
    setDisabledRegions(new Set());
    setLive({});
    setPhase("idle");
    setError(null);
    setSaveError(null);
    setSelectedId(null);
    setHistory([]);
  }

  function toggleRegion(targetId: string) {
    setDisabledRegions((current) => {
      const next = new Set(current);
      if (next.has(targetId)) next.delete(targetId);
      else next.add(targetId);
      return next;
    });
  }

  async function run() {
    if (targets.length === 0) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setSaveError(null);
    setSelectedId(null);
    setPhase("running");
    setLive(Object.fromEntries(targets.map((target) => [target.targetId, { samples: [], status: "pending" as const }])));

    const collected: Array<{ targetId: string; customHost?: string; samples: Sample[] }> = [];

    try {
      // Sequential, not parallel: concurrent probes would compete for bandwidth and skew each other.
      for (const target of targets) {
        setLive((current) => ({ ...current, [target.targetId]: { samples: [], status: "running" } }));
        const samples = await probeTarget(target.url, {
          samples: DEFAULT_SAMPLES,
          signal: controller.signal,
          onSample: (sample) =>
            setLive((current) => ({
              ...current,
              [target.targetId]: { samples: [...(current[target.targetId]?.samples ?? []), sample], status: "running" },
            })),
        });
        collected.push({ targetId: target.targetId, customHost: target.customHost, samples });
        setLive((current) => ({ ...current, [target.targetId]: { samples, status: "done" } }));
      }
    } catch {
      setPhase("idle");
      setError("Test cancelled.");
      return;
    } finally {
      abortRef.current = null;
    }

    setPhase("saving");
    try {
      const response = await fetch("/api/ping-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: pick, connectionType: getConnectionType(), targets: collected }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save results.");
      await loadHistory(pick);
    } catch (saveFailure) {
      setSaveError(saveFailure instanceof Error ? saveFailure.message : "Could not save results.");
    } finally {
      setPhase("done");
    }
  }

  // Ranking is computed locally with the same pure functions the server uses.
  const finished = targets.filter((target) => live[target.targetId]?.status === "done");
  const ranked = useMemo(
    () => rankTargets(finished.map((target) => ({ ...target, samples: live[target.targetId].samples }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live],
  );
  const recommendation = phase === "done" ? pickRecommendation(ranked) : null;
  const recommendedId = recommendation?.best.targetId ?? null;
  const focusId = selectedId ?? recommendedId ?? ranked[0]?.targetId ?? null;
  const focus = ranked.find((target) => target.targetId === focusId) ?? null;

  const rows: TableRow[] = (phase === "idle" && ranked.length === 0 ? [] : targets).map((target) => {
    const state = live[target.targetId];
    const rankedTarget = ranked.find((item) => item.targetId === target.targetId);
    return {
      targetId: target.targetId,
      label: target.label,
      location: target.location,
      nearby: target.nearby,
      status: state?.status ?? "pending",
      progress: (state?.samples.length ?? 0) / DEFAULT_SAMPLES,
      stats: rankedTarget?.stats ?? null,
      quality: rankedTarget?.quality ?? null,
    };
  });
  const sortedRows = phase === "done" ? [...rows].sort((a, b) => ranked.findIndex((t) => t.targetId === a.targetId) - ranked.findIndex((t) => t.targetId === b.targetId)) : rows;

  const trendTargetId = focusId ?? history[0]?.recommendedTargetId ?? null;
  const trendLabel = allTargets.find((target) => target.targetId === trendTargetId)?.label ?? trendTargetId;
  const trendPoints: TrendPoint[] = history
    .map((historyRun) => {
      const result = historyRun.results.find((item) => item.targetId === trendTargetId);
      return result ? { time: historyRun.createdAt, median: result.stats.median, jitter: result.stats.jitter } : null;
    })
    .filter((point): point is TrendPoint => point !== null)
    .reverse();

  const running = phase === "running" || phase === "saving";
  const progress = targets.length ? finished.length / targets.length : 0;

  return (
    <div className="flex flex-col gap-5">
      <Card className="space-y-5 p-5">
        <GamePicker value={pick} onChange={changeGame} disabled={running} />

        {game?.comingSoon ? (
          <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-300">
            <GameBadge game={game} />
            <div>
              <p className="font-semibold text-zinc-100">{game.name}: coming soon</p>
              <p className="mt-1 leading-6 text-zinc-400">{game.comingSoon}</p>
            </div>
          </div>
        ) : (
          <>
            {game ? (
              <fieldset disabled={running}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Regions to test ({targets.length}/{allTargets.length})
                </legend>
                <div className="flex flex-wrap gap-2">
                  {allTargets.map((target) => {
                    const on = !disabledRegions.has(target.targetId);
                    return (
                      <button
                        key={target.targetId}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleRegion(target.targetId)}
                        className={`rounded-full border px-3 py-1 text-xs transition disabled:opacity-60 ${
                          on ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-zinc-500 line-through"
                        }`}
                      >
                        {target.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <label className="block max-w-lg">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Custom host</span>
                <input
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  disabled={running}
                  placeholder="e.g. my-server.example.com"
                  className="mt-2 h-11 w-full rounded border border-white/10 bg-black/35 px-3 font-mono text-sm text-zinc-100 outline-none focus:border-cyan-300/50"
                />
                <span className="mt-1.5 block text-xs leading-5 text-zinc-500">
                  Must serve HTTPS. Most game servers don&apos;t, so use a website or web API hosted in the same data center.
                  {customInput && !customHost && <span className="text-red-300"> Enter a hostname or IPv4 address.</span>}
                </span>
              </label>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {running ? (
                <Button variant="ghost" onClick={() => abortRef.current?.abort()} disabled={phase === "saving"}>
                  {phase === "saving" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CircleStop className="h-4 w-4" aria-hidden />}
                  {phase === "saving" ? "Saving results" : `Stop (${finished.length}/${targets.length})`}
                </Button>
              ) : (
                <Button onClick={run} disabled={targets.length === 0}>
                  <Play className="h-4 w-4" aria-hidden />
                  {phase === "done" ? "Run again" : "Start test"}
                </Button>
              )}
              <p className="text-xs text-zinc-500">
                {DEFAULT_SAMPLES} requests per region · about {Math.max(5, Math.round(targets.length * 1.5))}s
              </p>
            </div>
            {running && (
              <div className="h-1 overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-cyan-300/70 transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
          </>
        )}

        <MethodNotice />
      </Card>

      {error && <p className="rounded border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">{error}</p>}
      {saveError && (
        <p className="flex items-center gap-2 rounded border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm text-yellow-100">
          <TriangleAlert className="h-4 w-4" aria-hidden />
          Results shown below but not saved to your history: {saveError}
        </p>
      )}

      {sortedRows.length > 0 && (
        <section className="grid gap-5 xl:grid-cols-[340px_1fr]">
          <div className="space-y-5">
            {phase === "done" && (
              <RecommendationCard
                game={game}
                best={recommendation ? { label: recommendation.best.label, location: recommendation.best.location, stats: recommendation.best.stats } : null}
                runnerUp={recommendation?.runnerUp ? { label: recommendation.runnerUp.label, location: recommendation.runnerUp.location, stats: recommendation.runnerUp.stats } : null}
                isTie={recommendation?.isTie ?? false}
              />
            )}
            {focus && (
              <Card className="p-4">
                <SampleTimelineChart label={focus.label} samples={focus.samples} median={focus.stats.median} />
              </Card>
            )}
          </div>
          <Card className="space-y-5 p-4">
            {ranked.length > 0 && (
              <RegionRankingChart
                results={ranked.map((target) => ({ targetId: target.targetId, targetLabel: target.label, endpointHost: target.url, samples: target.samples, stats: target.stats, score: target.score, quality: target.quality }))}
                recommendedId={recommendedId}
                selectedId={focusId}
                onSelect={setSelectedId}
              />
            )}
            <ResultsTable rows={sortedRows} recommendedId={recommendedId} selectedId={focusId} onSelect={setSelectedId} />
          </Card>
        </section>
      )}

      {!game?.comingSoon && (
        <section className="grid gap-5 xl:grid-cols-[1fr_400px]">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Connection quality over time</h2>
            {trendTargetId ? (
              <LatencyTrendChart points={trendPoints} title={`${trendLabel}: median round-trip time and jitter across your saved tests`} />
            ) : (
              <p className="text-sm text-zinc-500">Run a test to start tracking your connection over time.</p>
            )}
          </Card>
          {/* Keyed on the newest saved run so a fresh test refreshes the suggestions. */}
          <SuggestionsCard scope={pick} refreshKey={history[0]?.id ?? "none"} />
        </section>
      )}
    </div>
  );
}
