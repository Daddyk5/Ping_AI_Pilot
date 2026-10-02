import { HistoryExplorer } from "@/components/history/HistoryExplorer";
import { PageHeader } from "@/components/ui/Feedback";
import { requirePageUser } from "@/lib/auth";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  await requirePageUser("/history");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Test history" description="Every test you've run. Filter by game, server region or date." />
      <HistoryExplorer />
    </div>
  );
}
