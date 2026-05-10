"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { INITIAL_TELEMETRY } from "@/app/lib/constant";
import { nextTelemetryPoint } from "@/app/lib/ping-logic";

export function PingChart() {
  const [points, setPoints] = useState(INITIAL_TELEMETRY);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPoints((current) => {
        const next = nextTelemetryPoint(current[current.length - 1], current.length + 1);
        return [...current.slice(1), next];
      });
    }, 1600);

    return () => window.clearInterval(timer);
  }, []);

  const latest = points[points.length - 1];
  const average = useMemo(
    () => Math.round(points.reduce((sum, point) => sum + point.latency, 0) / points.length),
    [points],
  );

  return (
    <div className="h-[320px] min-h-[320px]">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Live Ping Stream</p>
          <p className="mt-1 text-sm text-zinc-500">Zero-click telemetry from the active route</p>
        </div>
        <div className="text-right font-mono">
          <p className="text-3xl text-cyan-100 ping-glow">{latest.latency}ms</p>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">avg {average}ms</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis
            width={48}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
            label={{
              value: "Latency in ms",
              angle: -90,
              position: "insideLeft",
              fill: "#71717a",
              fontSize: 11,
            }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(0,243,255,0.28)", strokeWidth: 1 }}
            contentStyle={{
              background: "rgba(9,9,11,0.92)",
              border: "1px solid rgba(0,243,255,0.28)",
              borderRadius: 8,
              color: "#fafafa",
              fontFamily: "var(--font-geist-mono)",
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#00f3ff"
            strokeWidth={2}
            fill="url(#latencyFill)"
            dot={false}
            activeDot={{ r: 4, stroke: "#09090b", strokeWidth: 2, fill: "#00f3ff" }}
            isAnimationActive
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PingChart;
