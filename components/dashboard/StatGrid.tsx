"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, Radio } from "lucide-react";
import { INITIAL_TELEMETRY } from "@/lib/constant";
import { classifySignal, stabilityScore, statusLabel } from "@/lib/ping-logic";
import { cn } from "@/lib/utils";

const latest = INITIAL_TELEMETRY[INITIAL_TELEMETRY.length - 1];
const status = classifySignal(latest);

const stats = [
  { label: "Latency", value: latest.latency, suffix: "ms", trend: "down", tone: "cyan" },
  { label: "Jitter", value: latest.jitter, suffix: "ms", trend: "flat", tone: "yellow" },
  { label: "Packet Loss", value: latest.loss, suffix: "%", trend: "flat", tone: "green" },
  { label: "Stability", value: stabilityScore(latest), suffix: "", trend: "up", tone: "green" },
] as const;

export function StatGrid() {
  return (
    <motion.section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {stats.map((stat, index) => {
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;

        return (
          <motion.div
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.36, ease: "easeOut" }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 p-4 shadow-[0_12px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:border-cyan-300/45 hover:shadow-[0_0_26px_rgba(0,243,255,0.16)]"
          >
            <div
              className={cn(
                "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100",
                stat.tone === "cyan" && "bg-cyan-300/10",
                stat.tone === "yellow" && "bg-yellow-300/10",
                stat.tone === "green" && "bg-lime-300/10",
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
              <div className="flex items-center gap-2">
                {index === 0 && <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-200" aria-hidden />}
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
            </div>
            <p className="mt-5 font-mono text-3xl text-zinc-50 ping-glow">
              <AnimatedNumber value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
              {stat.label === "Stability" ? statusLabel(status) : "last sample"}
            </p>
          </motion.div>
        );
      })}
    </motion.section>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 22, stiffness: 120 });
  const rounded = useTransform(spring, (latestValue) => Math.round(latestValue));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
}
