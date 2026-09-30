import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatTile({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold text-zinc-50">{value}</p>
      {detail && <p className="mt-1 truncate text-xs text-zinc-400">{detail}</p>}
    </Card>
  );
}
