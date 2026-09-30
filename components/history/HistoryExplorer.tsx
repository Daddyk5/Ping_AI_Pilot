"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, History as HistoryIcon, SearchX, Trash2, X, Zap } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { GameBadge } from "@/components/games/GameBadge";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState, Skeleton } from "@/components/ui/Feedback";
import { Field, Input, Select } from "@/components/ui/Field";
import { CUSTOM_TARGET_ID, GAMES, getGame, isTestableGame } from "@/lib/games/catalog";
import type { PingRunDto } from "@/lib/latency/types";
import { cn } from "@/lib/utils";

type Filters = { gameId: string; targetId: string; from: string; to: string };
const EMPTY: Filters = { gameId: "", targetId: "", from: "", to: "" };

function toQuery(filters: Filters) {
  const params = new URLSearchParams({ limit: "200" });
  if (filters.gameId) params.set("gameId", filters.gameId);
  if (filters.targetId) params.set("targetId", filters.targetId);
  // Date inputs are local calendar days; convert to the user's local midnight boundaries.
  if (filters.from) params.set("from", new Date(`${filters.from}T00:00:00`).toISOString());
  if (filters.to) params.set("to", new Date(`${filters.to}T23:59:59.999`).toISOString());
  return params.toString();
}

export function HistoryExplorer() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [runs, setRuns] = useState<PingRunDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const regions = useMemo(() => (filters.gameId ? (getGame(filters.gameId)?.regions ?? []) : []), [filters.gameId]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/ping-runs?${toQuery(filters)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load history.");
        setRuns(payload.runs as PingRunDto[]);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) setError(fetchError instanceof Error ? fetchError.message : "Could not load history.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, reloadKey]);

  async function deleteAll() {
    if (!window.confirm("Delete your entire test history? This can't be undone.")) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/ping-runs", { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).error ?? "Could not delete history.");
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete history.");
    } finally {
      setDeleting(false);
    }
  }

  const update = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));
  const filtered = filters.gameId !== "" || filters.targetId !== "" || filters.from !== "" || filters.to !== "";
  const groups = groupByDay(runs ?? []);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_170px_170px]">
          <Field label="Game">
            <Select value={filters.gameId} onChange={(event) => update({ gameId: event.target.value, targetId: "" })}>
              <option value="">All games</option>
              {GAMES.filter(isTestableGame).map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
              <option value={CUSTOM_TARGET_ID}>Custom hosts</option>
            </Select>
          </Field>
          <Field label="Server region">
            <Select value={filters.targetId} onChange={(event) => update({ targetId: event.target.value })} disabled={!filters.gameId || filters.gameId === CUSTOM_TARGET_ID}>
              <option value="">{filters.gameId ? "All regions" : "Choose a game first"}</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="From">
            <Input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => update({ from: event.target.value })} />
          </Field>
          <Field label="To">
            <Input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => update({ to: event.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-sm text-fg-3" aria-live="polite">
            {loading ? "Loading…" : `${runs?.length ?? 0} test${runs?.length === 1 ? "" : "s"}${runs?.length === 200 ? " (latest 200)" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            {filtered && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
                <X aria-hidden />
                Clear filters
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={deleteAll} loading={deleting} disabled={!runs?.length}>
              <Trash2 aria-hidden />
              Delete all
            </Button>
          </div>
        </div>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      {loading && !runs && (
        <Card className="space-y-3 p-5" aria-label="Loading history">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </Card>
      )}

      {runs && runs.length === 0 && !loading &&
        (filtered ? (
          <EmptyState
            icon={<SearchX />}
            title="No tests match these filters"
            description="Try a different game, region or date range."
            action={
              <Button variant="secondary" onClick={() => setFilters(EMPTY)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<HistoryIcon />}
            title="No tests yet"
            description="Every test you run in the optimizer is saved here, so you can see how your connection changes over time."
            action={
              <ButtonLink href="/optimizer">
                <Zap aria-hidden />
                Run your first test
              </ButtonLink>
            }
          />
        ))}

      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h2 className="mb-2 px-1 text-xs font-semibold text-fg-3">{group.label}</h2>
          <Card className="divide-y divide-line overflow-hidden">
            {group.runs.map((run) => {
              const game = getGame(run.gameId);
              const best = run.results.find((result) => result.targetId === run.recommendedTargetId) ?? run.results[0];
              const open = expanded === run.id;
              return (
                <div key={run.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : run.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
                  >
                    {game ? <GameBadge game={game} size="sm" /> : <span className="size-8 shrink-0 rounded-md border border-line-strong" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {game?.name ?? "Custom host"} <span className="text-fg-3">·</span> {best ? best.targetLabel : "No region reachable"}
                      </p>
                      <p className="text-xs text-fg-3">
                        {timeOfDay(run.createdAt)} · {run.results.length} region{run.results.length === 1 ? "" : "s"}
                        {run.connectionType && ` · ${run.connectionType}`}
                      </p>
                    </div>
                    {best && (
                      <span className="hidden sm:block">
                        <QualityBadge quality={best.quality} />
                      </span>
                    )}
                    <span className="tabular w-16 text-right font-mono text-sm font-semibold text-fg">{best ? formatMs(best.stats.median) : "—"}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-fg-3 transition", open && "rotate-180")} aria-hidden />
                  </button>
                  {open && (
                    <div className="animate-rise border-t border-line bg-surface-2/40 px-4 py-3">
                      <ul className="divide-y divide-line">
                        {run.results.map((result) => (
                          <li key={result.targetId} className="flex items-center gap-3 py-2 text-sm">
                            <span className="min-w-0 flex-1 truncate text-fg-2">
                              {result.targetLabel}
                              {result.targetId === run.recommendedTargetId && (
                                <Badge tone="accent" className="ml-2">
                                  Best
                                </Badge>
                              )}
                            </span>
                            <span className="tabular hidden text-xs text-fg-3 sm:block">
                              jitter {formatMs(result.stats.jitter)} · {Math.round(result.stats.failureRate * 100)}% failed
                            </span>
                            <QualityBadge quality={result.quality} />
                            <span className="tabular w-16 text-right font-mono font-semibold text-fg">{formatMs(result.stats.median)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </section>
      ))}
    </div>
  );
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });
const timeOfDay = (iso: string) => timeFormat.format(new Date(iso));

/** Groups newest-first runs into "Today", "Yesterday", then dated sections (local time). */
function groupByDay(runs: PingRunDto[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const groups: Array<{ label: string; runs: PingRunDto[] }> = [];
  for (const run of runs) {
    const date = new Date(run.createdAt);
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const daysAgo = Math.round((startOfToday.getTime() - day.getTime()) / 86_400_000);
    const label = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : dayFormat.format(date);
    const last = groups.at(-1);
    if (last?.label === label) last.runs.push(run);
    else groups.push({ label, runs: [run] });
  }
  return groups;
}
