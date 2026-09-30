import { notFound } from "next/navigation";
import { RunsByGameChart, RunsPerDayChart } from "@/components/admin/AdminCharts";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { isAdmin, requirePageUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getGame } from "@/lib/games/catalog";
import { logger } from "@/lib/logger";

export const metadata = { title: "Admin · PingPilot AI", robots: { index: false } };

type AdminStats = {
  generatedAt: string;
  users: { total: number; new7d: number; new30d: number; active7d: number; active30d: number };
  runs: { total: number; last30d: number };
  runsPerDay: Array<{ day: string; runs: number }>;
  runsByGame: Array<{ gameId: string; runs: number }>;
  runs7d: number;
};

const number = new Intl.NumberFormat("en");

export default async function AdminPage() {
  const { supabase, user } = await requirePageUser("/admin");

  // 404 rather than 403 so the page's existence isn't revealed to non-admins.
  // The SQL function re-checks the role claim, so this is not the only gate.
  if (!isAdmin(user)) notFound();

  const { data, error } = await supabase.rpc("admin_usage_stats");
  if (error || !data) {
    logger.error("admin.stats_failed", { userId: user.id, message: error?.message });
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <p className="rounded border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">Could not load usage stats: {error?.message ?? "no data"}</p>
      </div>
    );
  }

  const stats = data as AdminStats;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Usage analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">Aggregates only, no individual user data. Updated {formatDateTime(stats.generatedAt)}.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Users" value={number.format(stats.users.total)} detail={`+${stats.users.new7d} this week · +${stats.users.new30d} in 30 days`} />
        <StatTile label="Active users (ran a test)" value={number.format(stats.users.active7d)} detail={`7 days · ${stats.users.active30d} in 30 days`} />
        <StatTile label="Tests (30 days)" value={number.format(stats.runs.last30d)} detail={`${number.format(stats.runs.total)} all time`} />
        <StatTile
          label="Tests per active user (30 days)"
          value={stats.users.active30d ? (stats.runs.last30d / stats.users.active30d).toFixed(1) : "—"}
          detail={`${number.format(stats.runs7d)} tests this week`}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="p-4">
          <RunsPerDayChart data={stats.runsPerDay} />
        </Card>
        <Card className="p-4">
          <RunsByGameChart
            data={stats.runsByGame.map((entry) => ({ label: entry.gameId === "custom" ? "Custom" : (getGame(entry.gameId)?.shortName ?? entry.gameId), runs: entry.runs }))}
          />
        </Card>
      </section>
    </div>
  );
}
