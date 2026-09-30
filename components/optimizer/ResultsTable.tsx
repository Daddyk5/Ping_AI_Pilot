"use client";

import { Loader2, MapPin } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { QualityBadge } from "@/components/optimizer/QualityBadge";
import type { Quality } from "@/lib/latency/stats";
import type { LatencyStats } from "@/lib/latency/stats";
import { cn } from "@/lib/utils";

export type TableRow = {
  targetId: string;
  label: string;
  location: string;
  nearby: boolean;
  status: "pending" | "running" | "done";
  progress: number;
  stats: LatencyStats | null;
  quality: Quality | null;
};

/** Doubles as the accessible table view for the ranking chart. */
export function ResultsTable({
  rows,
  recommendedId,
  selectedId,
  onSelect,
}: {
  rows: TableRow[];
  recommendedId: string | null;
  selectedId: string | null;
  onSelect: (targetId: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-zinc-500">
          <tr>
            <th className="px-3 py-3 font-medium">Region</th>
            <th className="px-3 py-3 text-right font-medium">Median</th>
            <th className="px-3 py-3 text-right font-medium">95th pct</th>
            <th className="px-3 py-3 text-right font-medium">Jitter</th>
            <th className="px-3 py-3 text-right font-medium">Failed</th>
            <th className="px-3 py-3 font-medium">Quality</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 tabular-nums">
          {rows.map((row) => (
            <tr
              key={row.targetId}
              onClick={() => row.stats && onSelect(row.targetId)}
              className={cn(row.stats && "cursor-pointer hover:bg-white/[0.03]", row.targetId === selectedId && "bg-white/[0.04]")}
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2 text-zinc-100">
                  {row.label}
                  {row.targetId === recommendedId && (
                    <span className="rounded border border-cyan-300/40 bg-cyan-300/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-100">
                      Best
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {row.location}
                  {row.nearby && <span title="No test endpoint in the exact city; nearest one used.">· nearby endpoint</span>}
                </div>
              </td>
              {row.status === "done" && row.stats ? (
                <>
                  <td className="px-3 py-2.5 text-right font-mono text-zinc-100">{formatMs(row.stats.median)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-zinc-300">{formatMs(row.stats.p95)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-zinc-300">{formatMs(row.stats.jitter)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-zinc-300">{Math.round(row.stats.failureRate * 100)}%</td>
                  <td className="px-3 py-2.5">{row.quality && <QualityBadge quality={row.quality} />}</td>
                </>
              ) : (
                <td colSpan={5} className="px-3 py-2.5 text-xs text-zinc-500">
                  {row.status === "running" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-200" aria-hidden />
                      Testing… {Math.round(row.progress * 100)}%
                    </span>
                  ) : (
                    <QualityBadge quality="pending" />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
