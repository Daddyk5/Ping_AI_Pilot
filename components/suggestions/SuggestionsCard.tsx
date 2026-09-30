"use client";

import { useEffect, useState } from "react";
import { Cable, Clock, Database, Lightbulb, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Suggestion, SuggestionsDto } from "@/lib/suggestions/schema";

const CATEGORY = {
  region: { Icon: MapPin, label: "Region" },
  stability: { Icon: TriangleAlert, label: "Stability" },
  "time-of-day": { Icon: Clock, label: "Time of day" },
  connection: { Icon: Cable, label: "Connection" },
  data: { Icon: Database, label: "More data" },
} satisfies Record<Suggestion["category"], unknown>;

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
function ago(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

/** Rule-based suggestions for a scope. Re-fetches when `refreshKey` changes (e.g. after a new test). */
export function SuggestionsCard({ scope = "overview", refreshKey, compact = false }: { scope?: string; refreshKey?: string | number; compact?: boolean }) {
  const [data, setData] = useState<SuggestionsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Loading state flips here because this effect is the fetch trigger.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/suggestions?${new URLSearchParams({ scope, timeZone })}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load suggestions.");
        setData(payload.suggestions as SuggestionsDto);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load suggestions.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [scope, refreshKey]);

  const suggestions = compact ? data?.suggestions.slice(0, 2) : data?.suggestions;

  return (
    <Card className="p-5" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          <Lightbulb className="h-4 w-4" aria-hidden />
          Suggestions
        </h2>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" aria-label="Loading" />}
      </div>

      {error && !data && <p className="mt-4 text-sm text-zinc-400">{error}</p>}
      {!data && !error && <div className="mt-4 h-24 animate-pulse rounded bg-white/[0.03]" />}

      {data && (
        <>
          <p className="mt-3 text-base leading-7 text-zinc-100">{data.headline}</p>
          {suggestions && suggestions.length > 0 && (
            <ul className="mt-4 space-y-3">
              {suggestions.map((suggestion) => {
                const { Icon, label } = CATEGORY[suggestion.category];
                return (
                  <li key={suggestion.title} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" aria-label={label} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100">
                          {suggestion.title}
                          {suggestion.priority === "high" && <span className="sr-only"> (high priority)</span>}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-300">{suggestion.detail}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{suggestion.evidence}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Based on {data.basedOnRuns} test{data.basedOnRuns === 1 ? "" : "s"} in the last 30 days · updated {ago(data.generatedAt)}
          </p>
        </>
      )}
    </Card>
  );
}
