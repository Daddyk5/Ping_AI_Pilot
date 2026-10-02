"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { formatMs } from "@/components/charts/chart-theme";
import { QUALITY_TEXT, QualityBadge } from "@/components/optimizer/QualityBadge";
import { Badge } from "@/components/ui/Badge";
import type { LatencyStats, Quality } from "@/lib/latency/stats";
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

type Props = { rows: TableRow[]; recommendedId: string | null; selectedId: string | null; onSelect: (targetId: string) => void };

function Location({ row }: { row: TableRow }) {
  return (
    <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-3">
      <MapPin className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{row.location}</span>
      {row.nearby && <span title="No test endpoint in the exact city; the nearest one was used.">· nearby</span>}
    </span>
  );
}

/** Table on md+, stacked cards on phones. Doubles as the accessible table view for the ranking chart. */
export function ResultsTable({ rows, recommendedId, selectedId, onSelect }: Props) {
  const done = rows.filter((row) => row.status === "done" && row.stats);
  const [showAll, setShowAll] = useState(false);
  const MOBILE_LIMIT = 5;
  const mobileRows = showAll ? done : done.slice(0, MOBILE_LIMIT);

  return (
    <>
      {/* Phones: cards */}
      <ul className="space-y-2 md:hidden">
        {mobileRows.map((row, index) => (
          <li key={row.targetId}>
            <button
              type="button"
              onClick={() => onSelect(row.targetId)}
              aria-pressed={row.targetId === selectedId}
              className={cn("w-full rounded-xl border p-3.5 text-left transition", row.targetId === selectedId ? "border-accent/50 bg-accent-soft" : "border-line bg-surface-2")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-fg">
                    <span className="tabular text-xs text-fg-3">{index + 1}</span>
                    {row.label}
                    {row.targetId === recommendedId && <Badge tone="accent">Best</Badge>}
                  </p>
                  <Location row={row} />
                </div>
                <p className={cn("tabular shrink-0 whitespace-nowrap font-mono text-lg font-semibold", row.quality ? QUALITY_TEXT[row.quality] : "text-fg")}>{formatMs(row.stats!.median)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-fg-3">
                <span className="tabular">
                  jitter {formatMs(row.stats!.jitter)} · worst 5% {formatMs(row.stats!.p95)} · {Math.round(row.stats!.failureRate * 100)}% failed
                </span>
                {row.quality && <QualityBadge quality={row.quality} />}
              </div>
            </button>
          </li>
        ))}
        {done.length > MOBILE_LIMIT && (
          <li>
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-3 text-sm font-medium text-fg-2 hover:text-fg"
            >
              {showAll ? "Show fewer" : `Show all ${done.length} regions`}
              <ChevronDown className={cn("size-4 transition", showAll && "rotate-180")} aria-hidden />
            </button>
          </li>
        )}
      </ul>

      {/* md+: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs text-fg-3">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Region</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Median</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Worst 5%</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Jitter</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Failed</th>
              <th scope="col" className="px-4 py-3 font-medium">Quality</th>
            </tr>
          </thead>
          <tbody className="tabular divide-y divide-line">
            {done.map((row) => (
              <tr
                key={row.targetId}
                onClick={() => onSelect(row.targetId)}
                aria-selected={row.targetId === selectedId}
                className={cn("cursor-pointer transition hover:bg-white/[0.03]", row.targetId === selectedId && "bg-accent-soft hover:bg-accent-soft")}
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-fg">
                    {row.label}
                    {row.targetId === recommendedId && <Badge tone="accent">Best</Badge>}
                  </span>
                  <Location row={row} />
                </td>
                <td className={cn("px-4 py-3 text-right font-mono font-semibold", row.quality ? QUALITY_TEXT[row.quality] : "text-fg")}>{formatMs(row.stats!.median)}</td>
                <td className="px-4 py-3 text-right font-mono text-fg-2">{formatMs(row.stats!.p95)}</td>
                <td className="px-4 py-3 text-right font-mono text-fg-2">{formatMs(row.stats!.jitter)}</td>
                <td className="px-4 py-3 text-right font-mono text-fg-2">{Math.round(row.stats!.failureRate * 100)}%</td>
                <td className="px-4 py-3">{row.quality && <QualityBadge quality={row.quality} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
