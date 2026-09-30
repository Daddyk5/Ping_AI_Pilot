import { z } from "zod";
import { CUSTOM_TARGET_ID, GAMES, getGame, getRegion, isTestableGame, normalizeCustomHost } from "@/lib/games/catalog";

export const MAX_SAMPLES_PER_TARGET = 30;
export const MAX_RTT_MS = 10_000;

const sampleSchema = z.number().min(0).max(MAX_RTT_MS).nullable();

const targetSchema = z.object({
  targetId: z.string().min(1).max(64),
  customHost: z.string().max(260).optional(),
  samples: z.array(sampleSchema).min(1).max(MAX_SAMPLES_PER_TARGET),
});

export const pingRunInputSchema = z
  .object({
    gameId: z.enum([CUSTOM_TARGET_ID, ...GAMES.map((game) => game.id)]),
    connectionType: z.string().max(32).optional(),
    targets: z.array(targetSchema).min(1).max(40),
  })
  .superRefine((input, ctx) => {
    // gameId "custom" = standalone custom-host test, not tied to a game.
    const isCustomRun = input.gameId === CUSTOM_TARGET_ID;
    const game = getGame(input.gameId);
    if (!isCustomRun && (!game || !isTestableGame(game))) {
      ctx.addIssue({ code: "custom", path: ["gameId"], message: "This game can't be tested yet." });
      return;
    }

    const seen = new Set<string>();
    input.targets.forEach((target, index) => {
      if (seen.has(target.targetId)) {
        ctx.addIssue({ code: "custom", path: ["targets", index, "targetId"], message: "Duplicate target." });
      }
      seen.add(target.targetId);

      if (target.targetId === CUSTOM_TARGET_ID) {
        if (!target.customHost || !normalizeCustomHost(target.customHost)) {
          ctx.addIssue({ code: "custom", path: ["targets", index, "customHost"], message: "Invalid custom host." });
        }
      } else if (isCustomRun || !game || !getRegion(game, target.targetId)) {
        ctx.addIssue({ code: "custom", path: ["targets", index, "targetId"], message: "Unknown region for this game." });
      }
    });
  });

export type PingRunInput = z.infer<typeof pingRunInputSchema>;

export const pingRunQuerySchema = z.object({
  gameId: z.string().max(32).optional(),
  targetId: z.string().max(64).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type PingRunQuery = z.infer<typeof pingRunQuerySchema>;

/** Flattens zod issues into a short, client-safe message. */
export function formatZodError(error: z.ZodError) {
  return error.issues
    .slice(0, 5)
    .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
    .join("; ");
}
