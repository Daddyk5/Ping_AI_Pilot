"use client";

import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, chartColors, formatMs, statusColors } from "@/components/charts/chart-theme";
import { ChartTooltipBox } from "@/components/charts/ChartTooltip";
import type { Sample } from "@/lib/latency/stats";

// Single series: each timed request in order. Gaps in the line are failed requests,
// also marked with a critical dot on the baseline so failures aren't invisible.
export function SampleTimelineChart({ label, samples, median }: { label: string; samples: Sample[]; median: number | null }) {
  const data = samples.map((rtt, index) => ({ request: index + 1, rtt }));
  const failures = data.filter((datum) => datum.rtt === null);

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-fg-3">
        {label}: each request&apos;s round-trip time in ms{median !== null && <> · median {formatMs(median)}</>}
      </figcaption>
      <ResponsiveContainer width="100%" height={200} minWidth={0}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="request" {...axisProps} label={{ value: "Request #", position: "insideBottomRight", offset: -2, fill: chartColors.textMuted, fontSize: 11 }} />
          <YAxis {...axisProps} axisLine={false} width={36} domain={[0, "auto"]} />
          <Tooltip
            cursor={{ stroke: chartColors.axis }}
            content={({ active, payload }) => {
              const datum = active ? (payload?.[0]?.payload as { request: number; rtt: Sample } | undefined) : undefined;
              if (!datum) return null;
              return (
                <ChartTooltipBox
                  title={`Request ${datum.request}`}
                  rows={[{ key: "rtt", label: "Round trip", value: datum.rtt === null ? "Failed / timed out" : formatMs(datum.rtt) }]}
                />
              );
            }}
          />
          <Line
            type="linear"
            dataKey="rtt"
            stroke={chartColors.series[0]}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            dot={{ r: 4, fill: chartColors.series[0], stroke: chartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={false}
          />
          {failures.map((datum) => (
            <ReferenceDot key={datum.request} x={datum.request} y={0} r={4} fill={statusColors.critical} stroke={chartColors.surface} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {failures.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-3">
          <span className="h-2 w-2 rounded-full" style={{ background: statusColors.critical }} />
          {failures.length} failed or timed-out request{failures.length === 1 ? "" : "s"} (gaps in the line)
        </p>
      )}
    </figure>
  );
}
