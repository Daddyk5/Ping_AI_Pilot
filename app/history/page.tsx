import { Activity, TriangleAlert, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const events = [
  { time: "20:14", label: "Stable session", detail: "Valorant Oregon Edge stayed under 38ms", tone: "green", icon: Activity },
  { time: "20:47", label: "Caution window", detail: "Jitter crossed 14ms during upstream saturation", tone: "yellow", icon: TriangleAlert },
  { time: "21:02", label: "Packet loss detected", detail: "One percent loss observed for two samples", tone: "red", icon: WifiOff },
] as const;

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">History</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Telemetry Timeline</h1>
      </div>
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = event.icon;

          return (
            <Card key={event.time} className="flex items-start gap-4 p-4">
              <div className="grid h-10 w-10 place-items-center rounded border border-white/10 bg-white/[0.03]">
                <Icon className="h-5 w-5 text-cyan-200" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-sm text-zinc-500">{event.time}</p>
                  <Badge tone={event.tone}>{event.label}</Badge>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{event.detail}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
