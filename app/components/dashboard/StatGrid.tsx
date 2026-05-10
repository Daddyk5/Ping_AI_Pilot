import { Activity, Gauge, Radio, Wifi } from "lucide-react";

type StatGridProps = {
  ping?: number;
  jitter?: number;
  packetLoss?: number;
  status?: string;
};

export default function StatGrid({
  ping = 0,
  jitter = 0,
  packetLoss = 0,
  status = "Checking",
}: StatGridProps) {
  const stats = [
    {
      label: "Ping",
      value: `${ping} ms`,
      icon: <Gauge className="h-5 w-5" />,
    },
    {
      label: "Jitter",
      value: `${jitter} ms`,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: "Packet Loss",
      value: `${packetLoss}%`,
      icon: <Radio className="h-5 w-5" />,
    },
    {
      label: "Status",
      value: status,
      icon: <Wifi className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {stat.label}
            </span>

            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
              {stat.icon}
            </div>
          </div>

          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}