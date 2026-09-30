"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, chartColors, formatMs } from "@/components/charts/chart-theme";
import { ChartTooltipBox } from "@/components/charts/ChartTooltip";
import type { PingResultDto } from "@/lib/latency/types";

type Datum = { id: string; label: string; median: number; p95: number | null; jitter: number | null; failureRate: number };

// Emphasis form: the recommended region is the point (accent); others are context (gray).
// Single measure (median RTT), one axis. The results table below is the table view.
export function RegionRankingChart({
  results,
  recommendedId,
  selectedId,
  onSelect,
}: {
  results: PingResultDto[];
  recommendedId: string | null;
  selectedId?: string | null;
  onSelect?: (targetId: string) => void;
}) {
  const data: Datum[] = results
    .filter((result) => result.stats.median !== null)
    .map((result) => ({
      id: result.targetId,
      label: result.targetLabel,
      median: result.stats.median as number,
      p95: result.stats.p95,
      jitter: result.stats.jitter,
      failureRate: result.stats.failureRate,
    }));

  if (data.length === 0) return null;

  const height = Math.max(160, data.length * 34 + 40);

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-zinc-400">Median round-trip time by region (lower is better)</figcaption>
      <ResponsiveContainer width="100%" height={height} minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" {...axisProps} tickFormatter={(value) => `${value}`} unit=" ms" />
          <YAxis type="category" dataKey="label" width={140} {...axisProps} axisLine={false} tick={{ fill: chartColors.textSecondary, fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) => {
              const datum = active ? (payload?.[0]?.payload as Datum | undefined) : undefined;
              if (!datum) return null;
              return (
                <ChartTooltipBox
                  title={datum.label}
                  rows={[
                    { key: "median", label: "Median", value: formatMs(datum.median) },
                    { key: "p95", label: "95th percentile", value: formatMs(datum.p95) },
                    { key: "jitter", label: "Jitter", value: formatMs(datum.jitter) },
                    { key: "failed", label: "Failed requests", value: `${Math.round(datum.failureRate * 100)}%` },
                  ]}
                  footer={datum.id === recommendedId ? "Recommended" : onSelect ? "Click to see samples" : undefined}
                />
              );
            }}
          />
          <Bar
            dataKey="median"
            barSize={20}
            radius={[0, 4, 4, 0]}
            onClick={(entry) => onSelect?.((entry as unknown as Datum).id)}
            className={onSelect ? "cursor-pointer" : undefined}
          >
            {data.map((datum) => (
              <Cell
                key={datum.id}
                fill={datum.id === recommendedId ? chartColors.series[0] : chartColors.context}
                stroke={datum.id === selectedId ? chartColors.textPrimary : "none"}
                strokeWidth={datum.id === selectedId ? 1 : 0}
              />
            ))}
            <LabelList dataKey="median" position="right" formatter={(value) => formatMs(Number(value))} fill={chartColors.textSecondary} fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
