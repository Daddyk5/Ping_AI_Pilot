import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { SuggestionsCard } from "@/components/suggestions/SuggestionsCard";
import { formatMs } from "@/components/charts/chart-theme";
import { LatencyTrendChart, type TrendPoint } from "@/components/charts/LatencyTrendChart";
import { GameBadge } from "@/components/games/GameBadge";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { requirePageUser } from "@/lib/auth";
import { daysAgoIso, formatDateTime, timeAgo } from "@/lib/format";
import { GAMES, getGame, isTestableGame } from "@/lib/games/catalog";
import { listRuns } from "@/lib/latency/run-service";
import type { PingRunDto } from "@/lib/latency/types";
import { logger } from "@/lib/logger";

export const metadata = { title: "Dashboard · PingPilot AI" };

const WINDOW_DAYS = 30;

function gameName(gameId: string) {
  return gameId === "custom" ? "Custom host" : (getGame(gameId)?.shortName ?? gameId);
}

/** The route the user tests most: most frequent (game, recommended region) pair. */
function mostTestedRoute(runs: PingRunDto[]) {
  const counts = new Map<string, number>();
  for (const run of runs) {
    if (!run.recommendedTargetId) continue;
    const key = `${run.gameId}|${run.recommendedTargetId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const [gameId, targetId] = top[0].split("|");
  const points: TrendPoint[] = runs
    .filter((run) => run.gameId === gameId)
    .map((run) => {
      const result = run.results.find((item) => item.targetId === targetId);
      return result ? { time: run.createdAt, median: result.stats.median, jitter: result.stats.jitter } : null;
    })
    .filter((point): point is TrendPoint => point !== null)
    .reverse();
  const label = runs.flatMap((run) => run.results).find((result) => result.targetId === targetId)?.targetLabel ?? targetId;
  return { gameId, label, points };
}

export default async function DashboardPage() {
  const { supabase, user } = await requirePageUser("/dashboard");
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;

  let runs: PingRunDto[] = [];
  let loadError = false;
  try {
    runs = await listRuns(supabase, user.id, { from: daysAgoIso(WINDOW_DAYS), limit: 100 });
  } catch (error) {
    loadError = true;
    logger.error("dashboard.load_failed", { userId: user.id, error });
  }

  const latest = runs[0];
  const latestBest = latest?.results.find((result) => result.targetId === latest.recommendedTargetId) ?? null;
  const bestEver = runs
    .flatMap((run) => run.results.filter((result) => result.targetId === run.recommendedTargetId).map((result) => ({ run, result })))
    .filter(({ result }) => result.stats.median !== null)
    .sort((a, b) => a.result.stats.median! - b.result.stats.median!)[0];
  const route = mostTestedRoute(runs);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-50">{name ? `Welcome back, ${name}` : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-zinc-400">Your connection quality over the last {WINDOW_DAYS} days.</p>
        </div>
        <Link
          href="/optimizer"
          className="inline-flex h-10 items-center gap-2 self-start rounded border border-cyan-300/50 bg-cyan-300/15 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/25 sm:self-auto"
        >
          <Zap className="h-4 w-4" aria-hidden />
          Run a test
        </Link>
      </section>

      {loadError && (
        <p className="rounded border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm text-yellow-100">
          Your test history couldn&apos;t be loaded right now. The optimizer still works.
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tests (30 days)" value={runs.length} detail={latest ? `Last ${timeAgo(latest.createdAt)}` : "No tests yet"} />
        <StatTile
          label="Latest best route"
          value={latestBest ? formatMs(latestBest.stats.median) : "—"}
          detail={latestBest ? `${gameName(latest.gameId)} · ${latestBest.targetLabel}` : "Run the optimizer"}
        />
        <StatTile
          label="Latest jitter"
          value={latestBest ? formatMs(latestBest.stats.jitter) : "—"}
          detail={latestBest ? <QualityBadge quality={latestBest.quality} /> : undefined}
        />
        <StatTile
          label="Best result (30 days)"
          value={bestEver ? formatMs(bestEver.result.stats.median) : "—"}
          detail={bestEver ? `${gameName(bestEver.run.gameId)} · ${bestEver.result.targetLabel}` : undefined}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-5">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Your main route over time</h2>
            {route ? (
              <LatencyTrendChart points={route.points} title={`${gameName(route.gameId)} · ${route.label}: median round-trip time and jitter`} />
            ) : (
              <p className="text-sm text-zinc-500">Run a few tests and your most-used route will be tracked here.</p>
            )}
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Recent tests</h2>
              <Link href="/history" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-cyan-100">
                Full history <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
            {runs.length === 0 ? (
              <p className="text-sm text-zinc-500">No tests yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {runs.slice(0, 6).map((run) => {
                  const best = run.results.find((result) => result.targetId === run.recommendedTargetId);
                  const game = getGame(run.gameId);
                  return (
                    <li key={run.id} className="flex items-center gap-3 py-2.5">
                      {game ? <GameBadge game={game} size="sm" /> : <span className="h-8 w-8 rounded-md border border-white/15" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-100">
                          {gameName(run.gameId)} · {best ? `best ${best.targetLabel}` : "no region reachable"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDateTime(run.createdAt)} · {run.results.length} region{run.results.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-zinc-200">{best ? formatMs(best.stats.median) : "—"}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <SuggestionsCard scope="overview" refreshKey={latest?.id ?? "none"} />
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Quick launch</h2>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.filter(isTestableGame).map((game) => (
                <Link
                  key={game.id}
                  href={`/optimizer?game=${game.id}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 p-2 text-sm text-zinc-200 transition hover:border-cyan-300/40"
                >
                  <GameBadge game={game} size="sm" />
                  <span className="truncate">{game.shortName}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
