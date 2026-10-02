import Link from "next/link";
import { Activity, ArrowRight, Gauge, History as HistoryIcon, Route, Trophy, Zap } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { LatencyTrendChart, type TrendPoint } from "@/components/charts/LatencyTrendChart";
import { GameBadge } from "@/components/games/GameBadge";
import { QUALITY_TEXT, QualityBadge } from "@/components/optimizer/QualityBadge";
import { SuggestionsCard } from "@/components/suggestions/SuggestionsCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Alert, PageHeader } from "@/components/ui/Feedback";
import { StatTile } from "@/components/ui/StatTile";
import { formatDateTime, timeAgo } from "@/lib/format";
import { GAMES, getGame, isTestableGame } from "@/lib/games/catalog";
import type { PingRunDto } from "@/lib/latency/types";
import { cn } from "@/lib/utils";

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

function GamePickGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {GAMES.filter(isTestableGame).map((game) => (
        <Link
          key={game.id}
          href={`/optimizer?game=${game.id}`}
          className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-3"
        >
          <GameBadge game={game} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">{game.shortName}</span>
            <span className="block text-xs text-fg-3">{game.regions.length} regions</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function FirstRun({ name }: { name: string | null }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title={name ? `Welcome, ${name} 👋` : "Welcome 👋"} description="Let's find your fastest server. Your first test takes about 20 seconds." />
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Zap className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-fg">Run your first test</h2>
          <p className="mt-1.5 max-w-lg text-sm leading-6 text-fg-3">
            Pick the game you play. We&apos;ll test every one of its server regions from your connection and recommend the best one.
          </p>
          <div className="mt-6">
            <GamePickGrid />
          </div>
        </div>
      </Card>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Gauge, title: "Test", body: "Every region, measured from your own browser." },
          { icon: Trophy, title: "Pick", body: "We recommend the fastest, most stable region." },
          { icon: HistoryIcon, title: "Track", body: "Test again anytime and spot evening lag or ISP issues." },
        ].map((step) => (
          <li key={step.title} className="flex gap-3 rounded-xl border border-line bg-surface/60 p-4">
            <step.icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-fg">{step.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-fg-3">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DashboardView({ name, runs, loadError }: { name: string | null; runs: PingRunDto[]; loadError?: boolean }) {
  if (runs.length === 0 && !loadError) return <FirstRun name={name} />;

  const latest = runs[0];
  const latestBest = latest?.results.find((result) => result.targetId === latest.recommendedTargetId) ?? null;
  const bestEver = runs
    .flatMap((run) => run.results.filter((result) => result.targetId === run.recommendedTargetId).map((result) => ({ run, result })))
    .filter(({ result }) => result.stats.median !== null)
    .sort((a, b) => a.result.stats.median! - b.result.stats.median!)[0];
  const route = mostTestedRoute(runs);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={name ? `Hi, ${name}` : "Dashboard"}
        description={`Your connection quality over the last ${WINDOW_DAYS} days.`}
        actions={
          <ButtonLink href="/optimizer">
            <Zap aria-hidden />
            Run a test
          </ButtonLink>
        }
      />

      {loadError && (
        <Alert tone="warning" className="mb-5">
          Your test history couldn&apos;t be loaded right now. The optimizer still works.
        </Alert>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Activity />} label="Tests (30 days)" value={runs.length} detail={latest ? `Last ${timeAgo(latest.createdAt)}` : "No tests yet"} />
        <StatTile
          icon={<Route />}
          label="Latest best route"
          value={latestBest ? <span className={QUALITY_TEXT[latestBest.quality]}>{formatMs(latestBest.stats.median)}</span> : "—"}
          detail={latestBest ? `${gameName(latest.gameId)} · ${latestBest.targetLabel}` : "Run the optimizer"}
        />
        <StatTile icon={<Gauge />} label="Latest jitter" value={latestBest ? formatMs(latestBest.stats.jitter) : "—"} detail={latestBest ? <QualityBadge quality={latestBest.quality} /> : undefined} />
        <StatTile
          icon={<Trophy />}
          label="Best result (30 days)"
          value={bestEver ? <span className={QUALITY_TEXT[bestEver.result.quality]}>{formatMs(bestEver.result.stats.median)}</span> : "—"}
          detail={bestEver ? `${gameName(bestEver.run.gameId)} · ${bestEver.result.targetLabel}` : undefined}
        />
      </section>

      <section className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="p-5">
            <CardHeader title="Your main route over time" description={route ? `${gameName(route.gameId)} · ${route.label}` : undefined} />
            {route ? (
              <LatencyTrendChart points={route.points} title="Median round-trip time and jitter per test" />
            ) : (
              <p className="text-sm text-fg-3">Run a few tests and your most-used route will be tracked here.</p>
            )}
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Recent tests"
              action={
                <Link href="/history" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong">
                  View all <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              }
            />
            <ul className="-mx-2 divide-y divide-line">
              {runs.slice(0, 6).map((run) => {
                const best = run.results.find((result) => result.targetId === run.recommendedTargetId);
                const game = getGame(run.gameId);
                return (
                  <li key={run.id} className="flex items-center gap-3 rounded-lg px-2 py-3">
                    {game ? <GameBadge game={game} size="sm" /> : <span className="size-8 shrink-0 rounded-md border border-line-strong" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {gameName(run.gameId)} <span className="text-fg-3">·</span> {best ? best.targetLabel : "No region reachable"}
                      </p>
                      <p className="text-xs text-fg-3">
                        {formatDateTime(run.createdAt)} · {run.results.length} region{run.results.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {best && (
                      <span className="hidden sm:block">
                        <QualityBadge quality={best.quality} />
                      </span>
                    )}
                    <span className={cn("tabular w-16 text-right font-mono text-sm font-semibold", best ? QUALITY_TEXT[best.quality] : "text-fg-3")}>{best ? formatMs(best.stats.median) : "—"}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <SuggestionsCard scope="overview" refreshKey={latest?.id ?? "none"} />
          <Card className="p-5">
            <CardHeader title="Quick launch" description="Jump straight into a test." />
            <div className="grid grid-cols-2 gap-2">
              {GAMES.filter(isTestableGame).map((game) => (
                <Link
                  key={game.id}
                  href={`/optimizer?game=${game.id}`}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-2.5 text-sm font-medium text-fg-2 transition hover:border-accent/40 hover:text-fg"
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
