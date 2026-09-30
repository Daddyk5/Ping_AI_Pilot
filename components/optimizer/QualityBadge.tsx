import { CircleAlert, CircleCheck, CircleMinus, CircleX, TriangleAlert } from "lucide-react";
import type { Quality } from "@/lib/latency/stats";
import { statusColors } from "@/components/charts/chart-theme";

// Status colour always ships with an icon + label, never colour alone.
const QUALITY = {
  excellent: { label: "Excellent", color: statusColors.good, Icon: CircleCheck },
  good: { label: "Good", color: statusColors.good, Icon: CircleCheck },
  fair: { label: "Fair", color: statusColors.warning, Icon: TriangleAlert },
  poor: { label: "Poor", color: statusColors.serious, Icon: CircleAlert },
  unreachable: { label: "Unreachable", color: statusColors.critical, Icon: CircleX },
} satisfies Record<Quality, unknown>;

export function QualityBadge({ quality }: { quality: Quality | "pending" }) {
  if (quality === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <CircleMinus className="h-3.5 w-3.5" aria-hidden />
        Pending
      </span>
    );
  }

  const { label, color, Icon } = QUALITY[quality];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200">
      <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
      {label}
    </span>
  );
}
