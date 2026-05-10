"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { INITIAL_TELEMETRY } from "@/lib/constant";
import { classifySignal, stabilityScore, statusLabel } from "@/lib/ping-logic";
import { cn } from "@/lib/utils";

const latest = INITIAL_TELEMETRY[INITIAL_TELEMETRY.length - 1];
const status = classifySignal(latest);

const stats = [
  { label: "Latency", value: `${latest.latency}ms`, trend: "down", tone: "cyan" },
  { label: "Jitter", value: `${latest.jitter}ms`, trend: "flat", tone: "yellow" },
  { label: "Packet Loss", value: `${latest.loss}%`, trend: "flat", tone: "green" },
  { label: "Stability", value: `${stabilityScore(latest)}`, trend: "up", tone: "green" },
] as const;

export function StatGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;

        return (
          <div
            key={stat.label}
            className="group rounded-lg border border-white/10 bg-zinc-950/65 p-4 backdrop-blur transition hover:border-cyan-300/45 hover:shadow-[0_0_22px_rgba(0,243,255,0.16)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
              <TrendIcon
                className={cn(
                  "h-4 w-4",
                  stat.trend === "up" && "text-lime-300",
                  stat.trend === "down" && "text-cyan-200",
                  stat.trend === "flat" && "text-yellow-200",
                )}
                aria-hidden
              />
            </div>
            <p className="mt-5 font-mono text-3xl text-zinc-50 ping-glow">{stat.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
              {stat.label === "Stability" ? statusLabel(status) : "last sample"}
            </p>
          </div>
        );
      })}
    </section>
  );
}
