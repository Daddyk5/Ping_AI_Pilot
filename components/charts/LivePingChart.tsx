"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { INITIAL_TELEMETRY } from "@/lib/constant";
import { nextTelemetryPoint } from "@/lib/ping-logic";

export function LivePingChart() {
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
  const packetClean = points.filter((point) => point.loss === 0).length;

  return (
    <div className="min-h-[420px]">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(0,243,255,0.78)]" />
            Live Ping Stream
          </p>
          <p className="mt-1 text-sm text-zinc-500">Animated telemetry from the active route</p>
        </div>
        <div className="text-right font-mono">
          <motion.p
            key={latest.time}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl text-cyan-100 ping-glow"
          >
            {latest.latency}ms
          </motion.p>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">avg {average}ms</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <ResponsiveContainer width="100%" height={300} minWidth={0}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
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

        <div className="grid gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Jitter Trend</p>
            <ResponsiveContainer width="100%" height={86}>
              <LineChart data={points} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
                <Line type="monotone" dataKey="jitter" stroke="#facc15" strokeWidth={2} dot={false} isAnimationActive />
                <Tooltip
                  contentStyle={{
                    background: "rgba(9,9,11,0.92)",
                    border: "1px solid rgba(250,204,21,0.25)",
                    borderRadius: 8,
                    color: "#fafafa",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg border border-lime-300/20 bg-lime-300/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">Packet Health</p>
            <p className="mt-2 font-mono text-2xl text-zinc-50">{packetClean}/{points.length}</p>
            <p className="mt-1 text-xs text-zinc-400">clean samples in window</p>
          </div>
        </div>
      </div>
    </div>
  );
}
