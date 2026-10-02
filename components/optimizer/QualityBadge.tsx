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

/** Text colour for a latency figure, so ping reads at a glance (paired with a QualityBadge nearby). */
export const QUALITY_TEXT: Record<Quality, string> = {
  excellent: "text-success",
  good: "text-success",
  fair: "text-warning",
  poor: "text-serious",
  unreachable: "text-danger",
};

export function QualityBadge({ quality }: { quality: Quality | "pending" }) {
  if (quality === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg-3">
        <CircleMinus className="h-3.5 w-3.5" aria-hidden />
        Pending
      </span>
    );
  }

  const { label, color, Icon } = QUALITY[quality];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-fg-2">
      <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
      {label}
    </span>
  );
}
