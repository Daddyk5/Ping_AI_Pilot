"use client";

import { useEffect, useState } from "react";
import { Cable, Clock, Database, Lightbulb, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";
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
      <CardHeader
        icon={<Lightbulb />}
        title="Suggestions"
        action={loading && data ? <Loader2 className="size-4 animate-spin text-fg-3" aria-label="Refreshing" /> : undefined}
        className="mb-3"
      />

      {error && !data && <p className="text-sm text-fg-3">{error}</p>}
      {!data && !error && (
        <div className="space-y-3" aria-label="Loading suggestions">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}

      {data && (
        <>
          <p className="text-[15px] leading-7 text-fg">{data.headline}</p>
          {suggestions && suggestions.length > 0 && (
            <ul className="mt-4 space-y-2.5">
              {suggestions.map((suggestion) => {
                const { Icon, label } = CATEGORY[suggestion.category];
                return (
                  <li key={suggestion.title} className="rounded-xl border border-line bg-surface-2 p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-label={label}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                          {suggestion.title}
                          {suggestion.priority === "high" && (
                            <span className="size-1.5 shrink-0 rounded-full bg-warning" title="High priority">
                              <span className="sr-only">(high priority)</span>
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-fg-2">{suggestion.detail}</p>
                        <p className="mt-2 border-l-2 border-accent/30 pl-2.5 text-xs leading-5 text-fg-3">{suggestion.evidence}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs leading-5 text-fg-3">
            Based on {data.basedOnRuns} test{data.basedOnRuns === 1 ? "" : "s"} in the last 30 days · updated {ago(data.generatedAt)}
          </p>
        </>
      )}
    </Card>
  );
}
