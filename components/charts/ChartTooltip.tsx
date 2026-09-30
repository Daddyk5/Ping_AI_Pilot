import type { ReactNode } from "react";
import { chartColors } from "@/components/charts/chart-theme";

type Row = { key: string; label: string; value: string; swatch?: string };

/** Shared tooltip chrome: text stays in text tokens; a colored swatch carries identity. */
export function ChartTooltipBox({ title, rows, footer }: { title: string; rows: Row[]; footer?: ReactNode }) {
  return (
    <div
      className="min-w-40 rounded-md border px-3 py-2 text-xs shadow-xl"
      style={{ background: "rgba(12,12,14,0.96)", borderColor: "rgba(255,255,255,0.12)", color: chartColors.textPrimary }}
    >
      <p className="mb-1.5 font-semibold">{title}</p>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-1.5" style={{ color: chartColors.textSecondary }}>
              {row.swatch && <span className="h-2 w-2 rounded-full" style={{ background: row.swatch }} />}
              {row.label}
            </dt>
            <dd className="font-mono tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-1.5" style={{ color: chartColors.textMuted }}>{footer}</div>}
    </div>
  );
}
