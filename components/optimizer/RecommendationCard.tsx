import { Radar, Scale } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { GameBadge } from "@/components/games/GameBadge";
import type { Game } from "@/lib/games/catalog";
import type { LatencyStats } from "@/lib/latency/stats";

type Pick = { label: string; location: string; stats: LatencyStats };

export function RecommendationCard({ game, best, runnerUp, isTie }: { game: Game | null; best: Pick | null; runnerUp: Pick | null; isTie: boolean }) {
  if (!best) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-100">
        None of the tested endpoints responded. Check your connection, VPN or firewall, then try again.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/[0.06] p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
        <Radar className="h-4 w-4" aria-hidden />
        Recommended region
      </div>
      <div className="mt-4 flex items-center gap-3">
        {game && <GameBadge game={game} size="lg" />}
        <div>
          <p className="text-2xl font-semibold text-zinc-50">{best.label}</p>
          <p className="text-sm text-zinc-400">{best.location}</p>
        </div>
      </div>
      <p className="mt-5 text-5xl font-semibold text-zinc-50">{formatMs(best.stats.median)}</p>
      <p className="mt-1 text-sm text-zinc-400">
        median · jitter {formatMs(best.stats.jitter)} · {Math.round(best.stats.failureRate * 100)}% failed
      </p>
      {runnerUp && (
        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-zinc-300">
          <Scale className="mt-1 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          {isTie
            ? `${runnerUp.label} is effectively tied (${formatMs(runnerUp.stats.median)}). Pick whichever has better matchmaking for you.`
            : `Next best: ${runnerUp.label} at ${formatMs(runnerUp.stats.median)}.`}
        </p>
      )}
    </div>
  );
}
