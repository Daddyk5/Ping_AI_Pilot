"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, chartColors, formatMs } from "@/components/charts/chart-theme";
import { ChartTooltipBox } from "@/components/charts/ChartTooltip";

export type TrendPoint = { time: string; median: number | null; jitter: number | null };

const SERIES = [
  { key: "median", label: "Median RTT", color: chartColors.series[0] },
  { key: "jitter", label: "Jitter", color: chartColors.series[1] },
] as const;

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// Two series in the same unit (ms) share one axis. Legend present (2 series) and each line is
// direct-labelled via the legend swatches; the tooltip carries exact values.
export function LatencyTrendChart({ points, title }: { points: TrendPoint[]; title: string }) {
  if (points.length < 2) {
    return (
      <div className="grid h-40 place-items-center rounded border border-dashed border-white/10 text-center text-sm text-zinc-500">
        Run at least two tests to see a trend over time.
      </div>
    );
  }

  const data = points.map((point) => ({ ...point, t: new Date(point.time).getTime() }));

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-zinc-400">{title}</figcaption>
      <ResponsiveContainer width="100%" height={240} minWidth={0}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            {...axisProps}
            tickFormatter={(value) => dateFormat.format(new Date(value))}
          />
          <YAxis {...axisProps} axisLine={false} width={44} unit=" ms" domain={[0, "auto"]} />
          <Legend
            verticalAlign="top"
            align="left"
            height={28}
            content={() => (
              <ul className="flex gap-4 text-xs text-zinc-300">
                {SERIES.map((series) => (
                  <li key={series.key} className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded" style={{ background: series.color }} />
                    {series.label}
                  </li>
                ))}
              </ul>
            )}
          />
          <Tooltip
            cursor={{ stroke: chartColors.axis }}
            content={({ active, payload }) => {
              const datum = active ? (payload?.[0]?.payload as (TrendPoint & { t: number }) | undefined) : undefined;
              if (!datum) return null;
              return (
                <ChartTooltipBox
                  title={dateTimeFormat.format(new Date(datum.t))}
                  rows={SERIES.map((series) => ({ key: series.key, label: series.label, value: formatMs(datum[series.key]), swatch: series.color }))}
                />
              );
            }}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              stroke={series.color}
              strokeWidth={2}
              dot={data.length <= 20 ? { r: 4, fill: series.color, stroke: chartColors.surface, strokeWidth: 2 } : false}
              activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
