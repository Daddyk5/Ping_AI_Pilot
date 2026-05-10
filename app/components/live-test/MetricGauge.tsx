import { Activity } from "lucide-react";
import { cn } from "@/app/lib/utils";

type MetricGaugeProps = {
  label?: string;
  value?: number;
  unit?: string;
  cautionAt?: number;
  dangerAt?: number;
};

export function MetricGauge({
  label = "Route Stability",
  value = 92,
  unit = "%",
  cautionAt = 70,
  dangerAt = 45,
}: MetricGaugeProps) {
  const tone = value <= dangerAt ? "text-red-300" : value <= cautionAt ? "text-yellow-200" : "text-lime-200";
  const ring = value <= dangerAt ? "#ff2d55" : value <= cautionAt ? "#facc15" : "#39ff14";
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Metric Gauge</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-50">{label}</h2>
        </div>
        <Activity className="h-5 w-5 text-cyan-200" aria-hidden />
      </div>

      <div className="grid place-items-center">
        <div className="relative h-40 w-40">
          <svg className="-rotate-90" viewBox="0 0 140 140" role="img" aria-label={`${label}: ${value}${unit}`}>
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={ring}
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={`${dash} ${circumference - dash}`}
              className="drop-shadow-[0_0_10px_currentColor]"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className={cn("font-mono text-4xl ping-glow", tone)}>
                {value}
                <span className="text-lg">{unit}</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">Live score</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetricGauge;
