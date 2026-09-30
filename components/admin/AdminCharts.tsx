"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, chartColors } from "@/components/charts/chart-theme";
import { ChartTooltipBox } from "@/components/charts/ChartTooltip";

const dayFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

// Single-series magnitude charts: one hue, thin marks, 4px rounded data-ends, one axis.

export function RunsPerDayChart({ data }: { data: Array<{ day: string; runs: number }> }) {
  if (data.length === 0) return <p className="text-sm text-zinc-500">No tests in the last 30 days.</p>;

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-zinc-400">Optimizer tests per day (UTC), last 30 days</figcaption>
      <ResponsiveContainer width="100%" height={220} minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="day" {...axisProps} tickFormatter={(value) => dayFormat.format(new Date(value))} minTickGap={24} />
          <YAxis {...axisProps} axisLine={false} width={36} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) => {
              const datum = active ? (payload?.[0]?.payload as { day: string; runs: number } | undefined) : undefined;
              return datum ? <ChartTooltipBox title={dayFormat.format(new Date(datum.day))} rows={[{ key: "runs", label: "Tests", value: String(datum.runs) }]} /> : null;
            }}
          />
          <Bar dataKey="runs" fill={chartColors.series[0]} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}

export function RunsByGameChart({ data }: { data: Array<{ label: string; runs: number }> }) {
  if (data.length === 0) return <p className="text-sm text-zinc-500">No tests in the last 30 days.</p>;

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-zinc-400">Tests by game, last 30 days</figcaption>
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 34 + 30)} minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" {...axisProps} allowDecimals={false} />
          <YAxis type="category" dataKey="label" {...axisProps} axisLine={false} width={110} tick={{ fill: chartColors.textSecondary, fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) => {
              const datum = active ? (payload?.[0]?.payload as { label: string; runs: number } | undefined) : undefined;
              return datum ? <ChartTooltipBox title={datum.label} rows={[{ key: "runs", label: "Tests", value: String(datum.runs) }]} /> : null;
            }}
          />
          <Bar dataKey="runs" fill={chartColors.series[0]} radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
