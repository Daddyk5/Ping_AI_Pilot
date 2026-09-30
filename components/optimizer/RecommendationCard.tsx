import { MapPin, Scale, Sparkles, WifiOff } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { GameBadge } from "@/components/games/GameBadge";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import { Card } from "@/components/ui/Card";
import type { Game } from "@/lib/games/catalog";
import type { LatencyStats, Quality } from "@/lib/latency/stats";

type Pick = { label: string; location: string; stats: LatencyStats; quality: Quality };

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/70 px-3 py-2.5">
      <p className="text-[11px] font-medium text-fg-3">{label}</p>
      <p className="tabular mt-0.5 font-mono text-sm font-semibold text-fg">{value}</p>
    </div>
  );
}

export function RecommendationCard({ game, best, runnerUp, isTie }: { game: Game | null; best: Pick | null; runnerUp: Pick | null; isTie: boolean }) {
  if (!best) {
    return (
      <Card className="border-red-300/25 p-6">
        <WifiOff className="size-6 text-danger" aria-hidden />
        <p className="mt-3 font-semibold text-fg">No region responded</p>
        <p className="mt-1 text-sm leading-6 text-fg-3">Check your internet connection, VPN or firewall, then test again.</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-accent/30 p-6">
      <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <Sparkles className="size-3.5" aria-hidden />
          Your best region
        </p>
        <div className="mt-4 flex items-center gap-3">
          {game && <GameBadge game={game} size="lg" />}
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold tracking-tight text-fg">{best.label}</p>
            <p className="flex items-center gap-1 truncate text-sm text-fg-3">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {best.location}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <p className="tabular text-6xl font-semibold tracking-tighter text-fg">
            {Math.round(best.stats.median ?? 0)}
            <span className="ml-1 text-xl font-medium tracking-normal text-fg-3">ms</span>
          </p>
          <QualityBadge quality={best.quality} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Jitter" value={formatMs(best.stats.jitter)} />
          <Metric label="Worst 5%" value={formatMs(best.stats.p95)} />
          <Metric label="Failed" value={`${Math.round(best.stats.failureRate * 100)}%`} />
        </div>

        {runnerUp && (
          <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-sm leading-6 text-fg-2">
            <Scale className="mt-1 size-4 shrink-0 text-fg-3" aria-hidden />
            {isTie ? (
              <span>
                <strong className="font-semibold text-fg">{runnerUp.label}</strong> is effectively tied at {formatMs(runnerUp.stats.median)}. Pick whichever gives you better matchmaking.
              </span>
            ) : (
              <span>
                Next best: <strong className="font-semibold text-fg">{runnerUp.label}</strong> at {formatMs(runnerUp.stats.median)}.
              </span>
            )}
          </p>
        )}
      </div>
    </Card>
  );
}
