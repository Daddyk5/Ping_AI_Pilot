"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Trash2 } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { GameBadge } from "@/components/games/GameBadge";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { CUSTOM_TARGET_ID, GAMES, getGame, isTestableGame } from "@/lib/games/catalog";
import type { PingRunDto } from "@/lib/latency/types";
import { cn } from "@/lib/utils";

type Filters = { gameId: string; targetId: string; from: string; to: string };
const EMPTY: Filters = { gameId: "", targetId: "", from: "", to: "" };

const selectClass = "h-10 w-full rounded border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/50";

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

  return (
    <div className="flex flex-col gap-5">
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_160px_auto]">
        <label className="text-xs text-zinc-500">
          Game
          <select className={cn(selectClass, "mt-1")} value={filters.gameId} onChange={(event) => update({ gameId: event.target.value, targetId: "" })}>
            <option value="">All games</option>
            {GAMES.filter(isTestableGame).map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
            <option value={CUSTOM_TARGET_ID}>Custom hosts</option>
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          Server region
          <select
            className={cn(selectClass, "mt-1")}
            value={filters.targetId}
            onChange={(event) => update({ targetId: event.target.value })}
            disabled={!filters.gameId || filters.gameId === CUSTOM_TARGET_ID}
          >
            <option value="">{filters.gameId ? "All regions" : "Pick a game first"}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          From
          <input type="date" className={cn(selectClass, "mt-1 [color-scheme:dark]")} value={filters.from} max={filters.to || undefined} onChange={(event) => update({ from: event.target.value })} />
        </label>
        <label className="text-xs text-zinc-500">
          To
          <input type="date" className={cn(selectClass, "mt-1 [color-scheme:dark]")} value={filters.to} min={filters.from || undefined} onChange={(event) => update({ to: event.target.value })} />
        </label>
        <div className="flex items-end gap-2">
          <Button variant="ghost" onClick={() => setFilters(EMPTY)} disabled={filters === EMPTY}>
            Reset
          </Button>
        </div>
      </Card>

      {error && <p className="rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm text-zinc-400">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading
              </span>
            ) : (
              `${runs?.length ?? 0} test${runs?.length === 1 ? "" : "s"}${runs?.length === 200 ? " (showing the latest 200)" : ""}`
            )}
          </p>
          <Button variant="ghost" onClick={deleteAll} disabled={deleting || !runs?.length} className="h-8 text-xs">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete all
          </Button>
        </div>

        {runs && runs.length === 0 && !loading && <p className="p-6 text-center text-sm text-zinc-500">No tests match these filters.</p>}

        <ul className="divide-y divide-white/5">
          {runs?.map((run) => {
            const game = getGame(run.gameId);
            const best = run.results.find((result) => result.targetId === run.recommendedTargetId) ?? run.results[0];
            const open = expanded === run.id;
            return (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : run.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02]"
                >
                  {game ? <GameBadge game={game} size="sm" /> : <span className="h-8 w-8 shrink-0 rounded-md border border-white/15" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-100">
                      {game?.name ?? "Custom host"} · {best ? best.targetLabel : "—"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDateTime(run.createdAt)} · {run.results.length} region{run.results.length === 1 ? "" : "s"}
                      {run.connectionType && ` · ${run.connectionType}`}
                    </p>
                  </div>
                  {best && <QualityBadge quality={best.quality} />}
                  <span className="w-16 text-right font-mono text-sm tabular-nums text-zinc-200">{best ? formatMs(best.stats.median) : "—"}</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition", open && "rotate-180")} aria-hidden />
                </button>
                {open && (
                  <div className="overflow-x-auto px-4 pb-4">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                        <tr>
                          <th className="py-2 font-medium">Region</th>
                          <th className="py-2 text-right font-medium">Median</th>
                          <th className="py-2 text-right font-medium">95th pct</th>
                          <th className="py-2 text-right font-medium">Jitter</th>
                          <th className="py-2 text-right font-medium">Failed</th>
                          <th className="py-2 pl-4 font-medium">Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 tabular-nums">
                        {run.results.map((result) => (
                          <tr key={result.targetId}>
                            <td className="py-2 text-zinc-200">
                              {result.targetLabel}
                              {result.targetId === run.recommendedTargetId && <span className="ml-2 text-[10px] font-semibold uppercase text-cyan-200">Best</span>}
                            </td>
                            <td className="py-2 text-right font-mono text-zinc-100">{formatMs(result.stats.median)}</td>
                            <td className="py-2 text-right font-mono text-zinc-300">{formatMs(result.stats.p95)}</td>
                            <td className="py-2 text-right font-mono text-zinc-300">{formatMs(result.stats.jitter)}</td>
                            <td className="py-2 text-right font-mono text-zinc-300">{Math.round(result.stats.failureRate * 100)}%</td>
                            <td className="py-2 pl-4">
                              <QualityBadge quality={result.quality} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
