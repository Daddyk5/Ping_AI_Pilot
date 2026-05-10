import { AICoach } from "@/components/dashboard/AICoach";
import { CompareTable } from "@/components/dashboard/CompareTable";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { LivePingChart } from "@/components/charts/LivePingChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end">
        <div>
          <Badge tone="green">Stable Route</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">PingPilot AI</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Immediate clarity for competitive network diagnostics. Green means stable, yellow means caution, red means packet loss.
          </p>
        </div>
        <div className="rounded border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 font-mono text-sm text-cyan-100">
          Telemetry received: US-West route locked
        </div>
      </section>

      <StatGrid />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <LivePingChart />
        </Card>
        <AICoach />
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Compare</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-50">Game Server Recommendation</h2>
          </div>
        </div>
        <CompareTable />
      </section>
    </div>
  );
}
