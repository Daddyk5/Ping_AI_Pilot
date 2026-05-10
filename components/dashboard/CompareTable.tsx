import { Badge } from "@/components/ui/Badge";
import { SERVER_ROWS } from "@/lib/constant";

export function CompareTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Server Name</th>
              <th className="px-4 py-3 font-semibold">Latency</th>
              <th className="px-4 py-3 font-semibold">Jitter</th>
              <th className="px-4 py-3 font-semibold">Stability Score</th>
              <th className="px-4 py-3 font-semibold">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {SERVER_ROWS.map((row) => (
              <tr key={row.name} className="transition hover:bg-white/[0.03]">
                <td className="px-4 py-4 text-zinc-100">{row.name}</td>
                <td className="px-4 py-4 font-mono text-cyan-100 ping-glow">{row.latency}ms</td>
                <td className="px-4 py-4 font-mono text-zinc-300">{row.jitter}ms</td>
                <td className="px-4 py-4 font-mono text-zinc-300">{row.stability}/100</td>
                <td className="px-4 py-4">
                  <Badge
                    tone={row.recommendation === "Best" ? "green" : row.recommendation === "Caution" ? "yellow" : row.recommendation === "Avoid" ? "red" : "neutral"}
                    className={row.recommendation === "Best" ? "pulse-green" : ""}
                  >
                    {row.recommendation}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
