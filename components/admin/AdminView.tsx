import { Activity, BarChart3, Gauge, Users } from "lucide-react";
import { RunsByGameChart, RunsPerDayChart } from "@/components/admin/AdminCharts";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Feedback";
import { StatTile } from "@/components/ui/StatTile";
import { formatDateTime } from "@/lib/format";
import { getGame } from "@/lib/games/catalog";

export type AdminStats = {
  generatedAt: string;
  users: { total: number; new7d: number; new30d: number; active7d: number; active30d: number };
  runs: { total: number; last30d: number };
  runsPerDay: Array<{ day: string; runs: number }>;
  runsByGame: Array<{ gameId: string; runs: number }>;
  runs7d: number;
};

const number = new Intl.NumberFormat("en");

export function AdminView({ stats }: { stats: AdminStats }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Usage analytics"
        description={`Aggregate totals only, no individual user data. Updated ${formatDateTime(stats.generatedAt)}.`}
        actions={<Badge tone="accent">Admin</Badge>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Users />} label="Users" value={number.format(stats.users.total)} detail={`+${stats.users.new7d} this week · +${stats.users.new30d} in 30 days`} />
        <StatTile icon={<Activity />} label="Active users (7 days)" value={number.format(stats.users.active7d)} detail={`${number.format(stats.users.active30d)} in 30 days`} />
        <StatTile icon={<Gauge />} label="Tests (30 days)" value={number.format(stats.runs.last30d)} detail={`${number.format(stats.runs.total)} all time`} />
        <StatTile
          icon={<BarChart3 />}
          label="Tests per active user"
          value={stats.users.active30d ? (stats.runs.last30d / stats.users.active30d).toFixed(1) : "—"}
          detail={`${number.format(stats.runs7d)} tests this week`}
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <CardHeader title="Tests per day" description="Last 30 days (UTC)" />
          <RunsPerDayChart data={stats.runsPerDay} />
        </Card>
        <Card className="p-5">
          <CardHeader title="Most-tested games" description="Last 30 days" />
          <RunsByGameChart
            data={stats.runsByGame.map((entry) => ({ label: entry.gameId === "custom" ? "Custom" : (getGame(entry.gameId)?.shortName ?? entry.gameId), runs: entry.runs }))}
          />
        </Card>
      </section>
    </div>
  );
}
