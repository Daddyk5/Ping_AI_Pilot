import { z } from "zod";

export type Suggestion = {
  title: string;
  /** One or two plain-language sentences: what to do and why. */
  detail: string;
  /** The specific numbers that support it, e.g. "Evening jitter 24 ms vs 6 ms in the morning". */
  evidence: string;
  category: "region" | "stability" | "time-of-day" | "connection" | "data";
  priority: "high" | "medium" | "low";
};

export type SuggestionSet = {
  headline: string;
  dataQuality: "insufficient" | "limited" | "good";
  suggestions: Suggestion[];
};

export type SuggestionsDto = SuggestionSet & {
  scope: string;
  generatedAt: string;
  basedOnRuns: number;
};

export const suggestionRequestSchema = z.object({
  scope: z.union([z.literal("overview"), z.string().regex(/^[a-z0-9-]{1,32}$/)]).default("overview"),
  timeZone: z.string().max(64).default("UTC"),
});
