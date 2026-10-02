"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, CircleStop, Loader2, Play, Plus, RotateCcw } from "lucide-react";
import { SuggestionsCard } from "@/components/suggestions/SuggestionsCard";
import { LatencyTrendChart, type TrendPoint } from "@/components/charts/LatencyTrendChart";
import { RegionRankingChart } from "@/components/charts/RegionRankingChart";
import { SampleTimelineChart } from "@/components/charts/SampleTimelineChart";
import { GamePicker, type PickerValue } from "@/components/optimizer/GamePicker";
import { MethodNotice } from "@/components/optimizer/MethodNotice";
import { LiveTestPanel } from "@/components/optimizer/LiveTestPanel";
import { RecommendationCard } from "@/components/optimizer/RecommendationCard";
import { ResultsTable, type TableRow } from "@/components/optimizer/ResultsTable";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";
import { CUSTOM_TARGET_ID, customTargetUrl, getGame, normalizeCustomHost, PROBE_SITES, probeUrl, type Game } from "@/lib/games/catalog";
import { DEFAULT_SAMPLES, getConnectionType, probeTarget } from "@/lib/latency/probe";
import { pickRecommendation, rankTargets, type Sample } from "@/lib/latency/stats";
import type { PingRunDto } from "@/lib/latency/types";
import { cn } from "@/lib/utils";

type Target = { targetId: string; label: string; location: string; nearby: boolean; url: string; customHost?: string };
type LiveState = Record<string, { samples: Sample[]; status: "pending" | "running" | "done" }>;
type Phase = "idle" | "running" | "saving" | "done";

/** Rough time per region (10 sequential requests), for the duration estimates. */
const SECONDS_PER_TARGET = 1.5;

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
  const liveRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

  // On phones the setup card fills the screen, so bring the live panel / result into view.
  useEffect(() => {
    const target = phase === "running" ? liveRef.current : phase === "done" ? resultRef.current : null;
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [phase]);

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
  const current = targets.find((target) => live[target.targetId]?.status === "running") ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* Setup: game -> regions -> run. */}
      <Card className="p-5 sm:p-6">
        <StepLabel number={1}>Choose your game</StepLabel>
        <GamePicker value={pick} onChange={changeGame} disabled={running} />

        {game?.comingSoon ? (
          <Alert tone="info" title={`${game.name} is coming soon`} className="mt-5">
            {game.comingSoon}
          </Alert>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <StepLabel number={2}>{game ? "Regions to test" : "Server to test"}</StepLabel>
              {game ? (
                <RegionSelector targets={allTargets} disabled={disabledRegions} onToggle={toggleRegion} onReset={() => setDisabledRegions(new Set())} locked={running} />
              ) : (
                <Field
                  label="Custom host"
                  hint={
                    customInput && !customHost ? (
                      <span className="text-danger">Enter a hostname like play.example.com, or an IPv4 address.</span>
                    ) : (
                      "Must serve HTTPS. Most game servers don\u2019t, so use a website or web API hosted in the same data center."
                    )
                  }
                  className="max-w-lg"
                >
                  <Input value={customInput} onChange={(event) => setCustomInput(event.target.value)} disabled={running} placeholder="my-server.example.com" className="font-mono" />
                </Field>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:items-end">
              {running ? (
                <Button variant="secondary" size="lg" onClick={() => abortRef.current?.abort()} disabled={phase === "saving"} className="w-full lg:w-auto">
                  {phase === "saving" ? <Loader2 className="animate-spin" aria-hidden /> : <CircleStop aria-hidden />}
                  {phase === "saving" ? "Saving results\u2026" : "Stop test"}
                </Button>
              ) : (
                <Button size="lg" onClick={run} disabled={targets.length === 0} className="w-full lg:w-auto">
                  {phase === "done" ? <RotateCcw aria-hidden /> : <Play aria-hidden />}
                  {phase === "done" ? "Test again" : `Test ${targets.length} region${targets.length === 1 ? "" : "s"}`}
                </Button>
              )}
              <p className="text-center text-xs text-fg-3 lg:text-right">
                {DEFAULT_SAMPLES} requests per region · about {Math.max(5, Math.round(targets.length * SECONDS_PER_TARGET))} seconds
              </p>
            </div>
          </div>
        )}

        <MethodNotice />
      </Card>

      {error && <Alert tone="info">{error}</Alert>}
      {saveError && (
        <Alert tone="warning" title="Results not saved to your history">
          {saveError}
        </Alert>
      )}

      {running && (
        <div ref={liveRef} className="scroll-mt-20">
        <LiveTestPanel
          currentLabel={current?.label ?? null}
          done={finished.length}
          total={targets.length}
          progress={progress}
          saving={phase === "saving"}
          leaderboard={ranked.map((target) => ({ id: target.targetId, label: target.label, median: target.stats.median, quality: target.quality }))}
          queue={rows.map((row) => ({ id: row.targetId, label: row.label, status: row.status, median: row.stats?.median ?? null, quality: row.quality }))}
          secondsPerTarget={SECONDS_PER_TARGET}
        />
        </div>
      )}

      {phase === "done" && ranked.length > 0 && (
        <section ref={resultRef} className="grid scroll-mt-20 animate-rise gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <RecommendationCard
              game={game}
              best={recommendation ? { label: recommendation.best.label, location: recommendation.best.location, stats: recommendation.best.stats, quality: recommendation.best.quality } : null}
              runnerUp={recommendation?.runnerUp ? { label: recommendation.runnerUp.label, location: recommendation.runnerUp.location, stats: recommendation.runnerUp.stats, quality: recommendation.runnerUp.quality } : null}
              isTie={recommendation?.isTie ?? false}
            />
            {focus && (
              <Card className="p-5">
                <SampleTimelineChart label={focus.label} samples={focus.samples} median={focus.stats.median} />
              </Card>
            )}
          </div>
          <Card className="min-w-0 p-5">
            <CardHeader title="All regions" description="Select a region to see its individual requests." />
            <div className="hidden md:block">
            <RegionRankingChart
              results={ranked.map((target) => ({ targetId: target.targetId, targetLabel: target.label, endpointHost: target.url, samples: target.samples, stats: target.stats, score: target.score, quality: target.quality }))}
              recommendedId={recommendedId}
              selectedId={focusId}
              onSelect={setSelectedId}
            />
            </div>
            <div className="md:mt-5">
              <ResultsTable rows={sortedRows} recommendedId={recommendedId} selectedId={focusId} onSelect={setSelectedId} />
            </div>
          </Card>
        </section>
      )}

      {!game?.comingSoon && (
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <Card className="min-w-0 p-5">
            <CardHeader title="Connection quality over time" description={trendTargetId ? `${trendLabel} \u00b7 your saved tests` : undefined} />
            {trendTargetId ? (
              <LatencyTrendChart points={trendPoints} title="Median round-trip time and jitter" />
            ) : (
              <p className="text-sm text-fg-3">Run a test to start tracking your connection over time.</p>
            )}
          </Card>
          {/* Keyed on the newest saved run so a fresh test refreshes the suggestions. */}
          <SuggestionsCard scope={pick} refreshKey={history[0]?.id ?? "none"} />
        </section>
      )}
    </div>
  );
}

function StepLabel({ number, children }: { number: number; children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
      <span className="grid size-5 place-items-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">{number}</span>
      {children}
    </p>
  );
}

function RegionSelector({
  targets,
  disabled,
  onToggle,
  onReset,
  locked,
}: {
  targets: Target[];
  disabled: Set<string>;
  onToggle: (targetId: string) => void;
  onReset: () => void;
  locked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = targets.length - disabled.size;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-sm text-fg-2">{selected === targets.length ? `All ${targets.length} regions` : `${selected} of ${targets.length} regions`}</p>
        <button type="button" onClick={() => setOpen((value) => !value)} disabled={locked} aria-expanded={open} className="text-sm font-medium text-accent hover:text-accent-strong disabled:opacity-50">
          {open ? "Done" : "Choose regions"}
        </button>
        {disabled.size > 0 && !open && (
          <button type="button" onClick={onReset} disabled={locked} className="text-sm text-fg-3 hover:text-fg-2 disabled:opacity-50">
            Reset
          </button>
        )}
      </div>
      {open && (
        <fieldset disabled={locked} className="mt-3 flex animate-rise flex-wrap gap-2">
          <legend className="sr-only">Regions to test</legend>
          {targets.map((target) => {
            const on = !disabled.has(target.targetId);
            return (
              <button
                key={target.targetId}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(target.targetId)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  on ? "border-accent/40 bg-accent-soft text-fg" : "border-line text-fg-3 hover:border-line-strong",
                )}
              >
                {on ? <Check className="size-3 text-accent" aria-hidden /> : <Plus className="size-3" aria-hidden />}
                {target.label}
              </button>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
