import { LivePingChart } from "@/components/charts/LivePingChart";
import { AICoach } from "@/components/dashboard/AICoach";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { OptimizerPanel } from "@/components/live-test/OptimizerPanel";
import { Card } from "@/components/ui/Card";

export default function LiveTestPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Live Test</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Active Packet Stream</h1>
      </div>
      <StatGrid />
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <LivePingChart />
        </Card>
        <AICoach />
      </section>
      <OptimizerPanel />
    </div>
  );
}
