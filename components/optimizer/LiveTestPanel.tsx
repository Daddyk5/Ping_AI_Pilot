import { Loader2 } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import { Card } from "@/components/ui/Card";
import type { Quality } from "@/lib/latency/stats";

type LeaderRow = { id: string; label: string; median: number | null; quality: Quality };

/** Shown while a test runs: radar pulse, current region, progress, and a live leaderboard. */
export function LiveTestPanel({
  currentLabel,
  done,
  total,
  progress,
  saving,
  leaderboard,
}: {
  currentLabel: string | null;
  done: number;
  total: number;
  progress: number;
  saving: boolean;
  leaderboard: LeaderRow[];
}) {
  const max = Math.max(...leaderboard.map((row) => row.median ?? 0), 1);

  return (
    <Card className="animate-rise overflow-hidden p-5 sm:p-6" aria-live="polite">
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative grid size-36 place-items-center">
            <span className="absolute inset-0 rounded-full border border-accent/40 motion-safe:animate-radar" aria-hidden />
            <span className="absolute inset-0 rounded-full border border-accent/30 motion-safe:animate-radar [animation-delay:0.8s]" aria-hidden />
            <span className="absolute inset-0 rounded-full border border-accent/20 motion-safe:animate-radar [animation-delay:1.6s]" aria-hidden />
            <span className="grid size-20 place-items-center rounded-full border border-accent/40 bg-accent-soft">
              <span className="tabular text-2xl font-semibold text-fg">{Math.round(progress * 100)}%</span>
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-fg">{saving ? "Saving your results…" : currentLabel ? `Testing ${currentLabel}` : "Starting…"}</p>
          <p className="mt-1 text-xs text-fg-3">
            {done} of {total} regions done
          </p>
        </div>

        <div className="min-w-0">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Test progress">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mb-2 text-xs font-medium text-fg-3">Live leaderboard</p>
          {leaderboard.length === 0 ? (
            <p className="flex items-center gap-2 py-6 text-sm text-fg-3">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Waiting for the first region…
            </p>
          ) : (
            <ol className="space-y-1.5">
              {leaderboard.slice(0, 6).map((row, index) => (
                <li key={row.id} className="grid animate-rise grid-cols-[20px_minmax(0,110px)_1fr_auto] items-center gap-3 text-sm">
                  <span className="tabular text-xs text-fg-3">{index + 1}</span>
                  <span className="truncate font-medium text-fg">{row.label}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <span className={`block h-full rounded-full transition-all duration-500 ${index === 0 ? "bg-accent" : "bg-white/20"}`} style={{ width: `${((row.median ?? max) / max) * 100}%` }} />
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="hidden sm:inline">
                      <QualityBadge quality={row.quality} />
                    </span>
                    <span className="tabular w-14 text-right font-mono text-fg">{row.median === null ? "—" : formatMs(row.median)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Card>
  );
}
