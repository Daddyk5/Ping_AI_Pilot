import { HistoryExplorer } from "@/components/history/HistoryExplorer";
import { requirePageUser } from "@/lib/auth";

export const metadata = { title: "History · PingPilot AI" };

export default async function HistoryPage() {
  await requirePageUser("/history");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">History</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Test history</h1>
        <p className="mt-2 text-sm text-zinc-400">Every optimizer test you&apos;ve run. Filter by game, server region, or date.</p>
      </div>
      <HistoryExplorer />
    </div>
  );
}
