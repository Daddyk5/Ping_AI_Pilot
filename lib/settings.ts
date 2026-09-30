import { z } from "zod";
import { GAMES } from "@/lib/games/catalog";

export const settingsSchema = z.object({
  notifyWeeklySummary: z.boolean(),
  notifyDegradation: z.boolean(),
  defaultGame: z.enum(GAMES.map((game) => game.id) as [string, ...string[]]).nullable(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = { notifyWeeklySummary: false, notifyDegradation: false, defaultGame: null };

export function settingsFromRow(row: { notify_weekly_summary: boolean; notify_degradation: boolean; default_game: string | null } | null): Settings {
  if (!row) return DEFAULT_SETTINGS;
  return { notifyWeeklySummary: row.notify_weekly_summary, notifyDegradation: row.notify_degradation, defaultGame: row.default_game };
}
