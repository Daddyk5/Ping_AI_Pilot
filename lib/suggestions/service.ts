import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { daysAgoIso } from "@/lib/format";
import { listRuns } from "@/lib/latency/run-service";
import { buildFeatures } from "@/lib/suggestions/features";
import { ruleBasedSuggestions } from "@/lib/suggestions/rules";
import type { SuggestionsDto } from "@/lib/suggestions/schema";

export const WINDOW_DAYS = 30;

/** Suggestions for "overview" (all games) or one game id, from the last 30 days of tests. */
export async function getSuggestions(supabase: SupabaseClient, userId: string, { scope, timeZone }: { scope: string; timeZone: string }): Promise<SuggestionsDto> {
  const runs = await listRuns(supabase, userId, { gameId: scope === "overview" ? undefined : scope, from: daysAgoIso(WINDOW_DAYS), limit: 100 });
  const features = buildFeatures(runs, timeZone, WINDOW_DAYS);

  return {
    ...ruleBasedSuggestions(features),
    scope,
    generatedAt: new Date().toISOString(),
    basedOnRuns: features.runCount,
  };
}
