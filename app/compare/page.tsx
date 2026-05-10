import { CompareTable } from "@/components/dashboard/CompareTable";
import { Card } from "@/components/ui/Card";

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Server Compare</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Route Quality Matrix</h1>
      </div>
      <Card className="p-4">
        <CompareTable />
      </Card>
    </div>
  );
}
