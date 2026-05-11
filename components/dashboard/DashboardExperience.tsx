"use client";

import { motion } from "framer-motion";
import { Activity, Bell, BrainCircuit, CircleDot, Network, Radar, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { AICoach } from "@/components/dashboard/AICoach";
import { CompareTable } from "@/components/dashboard/CompareTable";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { LivePingChart } from "@/components/charts/LivePingChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { INITIAL_TELEMETRY, SERVER_ROWS } from "@/lib/constant";
import { stabilityScore } from "@/lib/ping-logic";

const section = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const activityItems = [
  { label: "Route lock confirmed", value: "US-West", tone: "text-lime-200" },
  { label: "Jitter variance normalized", value: "4ms", tone: "text-cyan-200" },
  { label: "AI coach recommendation queued", value: "Ready", tone: "text-violet-200" },
  { label: "Server comparison refreshed", value: "4 POPs", tone: "text-zinc-200" },
];

export function DashboardExperience() {
  const latest = INITIAL_TELEMETRY[INITIAL_TELEMETRY.length - 1];
  const health = stabilityScore(latest);
  const bestServer = SERVER_ROWS[0];

  return (
    <motion.div
      className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.08 }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-4 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      </div>

      <motion.section
        variants={section}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-6"
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge tone="green" className="gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-200 shadow-[0_0_12px_rgba(190,242,100,0.85)]" />
              Stable Route
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">PingPilot AI</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Enterprise-grade network telemetry for competitive routing. Latency, jitter, packet loss, and AI guidance stay visible without interrupting your flow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[390px]">
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <RefreshCw className="h-3.5 w-3.5 animate-spin [animation-duration:3s]" aria-hidden />
                Live Refresh
              </p>
              <p className="mt-2 font-mono text-sm text-zinc-200">Every 1.6s</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                <Bell className="h-3.5 w-3.5 text-lime-200" aria-hidden />
                Telemetry
              </p>
              <p className="mt-2 font-mono text-sm text-cyan-100">US-West route locked</p>
            </div>
          </div>
        </div>
      </motion.section>

      <StatGrid />

      <motion.section variants={section} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <LivePingChart />
        </Card>
        <AICoach />
      </motion.section>

      <motion.section variants={section} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr_1fr]">
        <HealthScore score={health} />
        <SystemStatus bestServer={bestServer.name} />
        <ActivityTimeline />
      </motion.section>

      <motion.section variants={section} className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Compare</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-50">Game Server Recommendation</h2>
            </div>
            <Badge tone="cyan" className="w-fit">Interactive Filters</Badge>
          </div>
          <CompareTable />
        </div>
        <NetworkActivity />
      </motion.section>
    </motion.div>
  );
}

function HealthScore({ score }: { score: number }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-lime-300/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-200">Health Score</p>
          <p className="mt-2 text-sm text-zinc-500">Composite route stability</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-lime-200" aria-hidden />
      </div>
      <div className="relative mt-6 grid place-items-center">
        <div className="relative h-36 w-36">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#bef264 ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <div className="absolute inset-3 grid place-items-center rounded-full bg-zinc-950/95">
            <div className="text-center">
              <p className="font-mono text-4xl text-zinc-50 ping-glow">{score}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">excellent</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SystemStatus({ bestServer }: { bestServer: string }) {
  const rows = [
    { icon: Activity, label: "Monitoring", value: "Active", tone: "text-lime-200" },
    { icon: Radar, label: "Route Target", value: bestServer, tone: "text-cyan-200" },
    { icon: BrainCircuit, label: "AI Insight", value: "Congestion watch", tone: "text-violet-200" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">System Status</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-50">Operations Overview</h2>
        </div>
        <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden />
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row, index) => {
          const Icon = row.icon;

          return (
            <motion.div
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.07 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded border border-white/10 bg-black/30">
                  <Icon className={`h-4 w-4 ${row.tone}`} aria-hidden />
                </span>
                <span className="text-sm text-zinc-400">{row.label}</span>
              </div>
              <span className="max-w-[150px] truncate text-right font-mono text-sm text-zinc-100">{row.value}</span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

function ActivityTimeline() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Activity</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-50">Signal Timeline</h2>
        </div>
        <CircleDot className="h-5 w-5 text-lime-200" aria-hidden />
      </div>
      <div className="mt-5 space-y-4">
        {activityItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="relative flex gap-3 pl-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.07 }}
          >
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(0,243,255,0.65)]" />
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-200">{item.label}</p>
              <p className={`mt-1 font-mono text-xs ${item.tone}`}>{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function NetworkActivity() {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(0,243,255,0.12),transparent_34%)]" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Network Activity</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-50">Packet Flow</h2>
        </div>
        <Network className="h-5 w-5 text-cyan-200" aria-hidden />
      </div>
      <div className="relative mt-7 grid grid-cols-8 items-end gap-2">
        {[34, 52, 44, 68, 58, 76, 49, 61].map((height, index) => (
          <motion.div
            key={index}
            className="rounded-t bg-gradient-to-t from-cyan-300/20 to-cyan-200 shadow-[0_0_18px_rgba(0,243,255,0.16)]"
            style={{ height }}
            animate={{ scaleY: [0.75, 1, 0.82] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <div className="relative mt-6 rounded-lg border border-lime-300/20 bg-lime-300/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">Recommendation</p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Stay on Oregon Edge. Current packet flow is clean and variance is below caution range.</p>
      </div>
    </Card>
  );
}
