import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatTile({ label, value, detail, icon }: { label: string; value: ReactNode; detail?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="flex items-center gap-2 text-xs font-medium text-fg-3 [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <p className="tabular mt-2 truncate text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{value}</p>
      {detail && <div className="mt-1 truncate text-xs text-fg-3">{detail}</div>}
    </Card>
  );
}
