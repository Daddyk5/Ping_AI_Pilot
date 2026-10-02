import { Loader2 } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { QUALITY_TEXT, QualityBadge } from "@/components/optimizer/QualityBadge";
import { Card } from "@/components/ui/Card";
import type { Quality } from "@/lib/latency/stats";
import { cn } from "@/lib/utils";

type LeaderRow = { id: string; label: string; median: number | null; quality: Quality };
export type QueueItem = { id: string; label: string; status: "pending" | "running" | "done"; median: number | null; quality: Quality | null };

const BLIP_COLOR: Record<Quality, string> = {
  excellent: "bg-success text-success",
  good: "bg-success text-success",
  fair: "bg-warning text-warning",
  poor: "bg-serious text-serious",
  unreachable: "bg-danger text-danger",
};

/** Radar scope: a sweep while testing, plus one blip per finished region (closer to the centre = lower ping). */
function Radar({ queue, progress }: { queue: QueueItem[]; progress: number }) {
  const max = Math.max(...queue.map((item) => item.median ?? 0), 1);

  return (
    <div className="relative size-44 shrink-0 overflow-hidden rounded-full border border-accent/25 bg-[radial-gradient(circle,rgb(46_227_242/0.08),transparent_70%)]" aria-hidden>
      <span className="absolute inset-[16%] rounded-full border border-accent/15" />
      <span className="absolute inset-[33%] rounded-full border border-accent/15" />
      <span className="absolute inset-x-0 top-1/2 h-px bg-accent/10" />
      <span className="absolute inset-y-0 left-1/2 w-px bg-accent/10" />
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_290deg,rgb(46_227_242/0.32)_360deg)] motion-safe:animate-sweep" />
      {queue.map((item, index) => {
        if (item.status !== "done" || !item.quality) return null;
        const angle = (index / queue.length) * 2 * Math.PI - Math.PI / 2;
        // Unreachable regions sit on the rim; the rest scale between 20% and 44% of the radius.
        const radius = item.median === null ? 46 : 20 + (item.median / max) * 24;
        return (
          <span
            key={item.id}
            className={cn("absolute size-2 -translate-x-1/2 -translate-y-1/2 animate-rise rounded-full shadow-[0_0_8px_currentColor]", BLIP_COLOR[item.quality])}
            style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%` }}
          />
        );
      })}
      <span className="absolute inset-[38%] grid place-items-center rounded-full border border-accent/40 bg-surface">
        <span className="tabular text-lg font-semibold text-fg">{Math.round(progress * 100)}%</span>
      </span>
    </div>
  );
}

/** Shown while a test runs: radar, current region, progress, a live leaderboard and the full region queue. */
export function LiveTestPanel({
  currentLabel,
  done,
  total,
  progress,
  saving,
  leaderboard,
  queue,
  secondsPerTarget,
}: {
  currentLabel: string | null;
  done: number;
  total: number;
  progress: number;
  saving: boolean;
  leaderboard: LeaderRow[];
  queue: QueueItem[];
  secondsPerTarget: number;
}) {
  const max = Math.max(...leaderboard.map((row) => row.median ?? 0), 1);
  const secondsLeft = Math.max(1, Math.round((total - done) * secondsPerTarget));

  return (
    <Card className="animate-rise overflow-hidden p-5 sm:p-6" aria-live="polite">
      <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col items-center text-center md:w-52">
          <Radar queue={queue} progress={progress} />
          <p className="mt-4 text-sm font-semibold text-fg">{saving ? "Saving your results…" : currentLabel ? `Testing ${currentLabel}` : "Starting…"}</p>
          <p className="tabular mt-1 text-xs text-fg-3">
            {done} of {total} regions{!saving && done < total && ` · about ${secondsLeft}s left`}
          </p>
        </div>

        <div className="min-w-0">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Test progress">
            <div className="h-full rounded-full bg-accent shadow-[0_0_12px_rgb(46_227_242/0.6)] transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mb-2 text-xs font-medium text-fg-3">Live leaderboard</p>
          {leaderboard.length === 0 ? (
            <p className="flex items-center gap-2 py-6 text-sm text-fg-3">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Waiting for the first region…
            </p>
          ) : (
            <ol className="space-y-1.5">
              {leaderboard.slice(0, 5).map((row, index) => (
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
                    <span className={cn("tabular w-14 text-right font-mono font-semibold", QUALITY_TEXT[row.quality])}>{row.median === null ? "—" : formatMs(row.median)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-4" aria-label="Regions">
        {queue.map((item) => (
          <li
            key={item.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition",
              item.status === "running" && "border-accent/50 bg-accent-soft text-fg",
              item.status === "done" && "border-line bg-surface-2 text-fg-2",
              item.status === "pending" && "border-dashed border-line text-fg-3",
            )}
          >
            {item.status === "running" && <Loader2 className="size-3 animate-spin text-accent" aria-hidden />}
            {item.label}
            {item.status === "done" && item.quality && (
              <span className={cn("tabular font-mono font-semibold", QUALITY_TEXT[item.quality])}>{item.median === null ? "—" : Math.round(item.median)}</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
