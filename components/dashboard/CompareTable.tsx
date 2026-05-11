"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SERVER_ROWS } from "@/lib/constant";
import { cn } from "@/lib/utils";

const filters = ["All", "Best", "Stable", "Caution", "Avoid"] as const;
type Filter = (typeof filters)[number];

export function CompareTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const rows = useMemo(() => {
    return SERVER_ROWS.filter((row) => {
      const matchesQuery = row.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter = filter === "All" || row.recommendation === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 shadow-[0_18px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-3 md:flex-row md:items-center md:justify-between">
        <label className="group flex h-10 min-w-0 items-center gap-2 rounded border border-white/10 bg-black/25 px-3 transition focus-within:border-cyan-300/45 md:w-80">
          <Search className="h-4 w-4 text-zinc-500 transition group-focus-within:text-cyan-200" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search server"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
        </label>
        <div className="flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "relative h-9 rounded border px-3 text-xs font-semibold uppercase tracking-[0.16em] transition",
                filter === item
                  ? "border-cyan-300/40 text-cyan-100"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200",
              )}
            >
              {filter === item && (
                <motion.span
                  layoutId="compare-filter"
                  className="absolute inset-0 -z-10 rounded bg-cyan-300/10 shadow-[0_0_18px_rgba(0,243,255,0.12)]"
                />
              )}
              {item}
            </button>
          ))}
        </div>
      </div>
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
            {rows.map((row) => (
              <motion.tr
                key={row.name}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="transition hover:bg-white/[0.045]"
              >
                <td className="px-4 py-4 text-zinc-100">{row.name}</td>
                <td className="px-4 py-4 font-mono text-cyan-100 ping-glow">{row.latency}ms</td>
                <td className="px-4 py-4 font-mono text-zinc-300">{row.jitter}ms</td>
                <td className="px-4 py-4 font-mono text-zinc-300">{row.stability}/100</td>
                <td className="px-4 py-4">
                  <Badge
                    tone={
                      row.recommendation === "Best"
                        ? "green"
                        : row.recommendation === "Caution"
                          ? "yellow"
                          : row.recommendation === "Avoid"
                            ? "red"
                            : "neutral"
                    }
                    className={row.recommendation === "Best" ? "pulse-green" : ""}
                  >
                    {row.recommendation}
                  </Badge>
                </td>
              </motion.tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No matching route telemetry. Clear the search or adjust the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
