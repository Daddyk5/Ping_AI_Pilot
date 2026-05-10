import { getGameById, getRegionById } from "@/lib/constants";
import type { AiCoachInput, GameId, PingTestInput, RegionId } from "@/types";

export function parseJsonBody<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object.");
  }

  return body as T;
}

export function validatePingTestInput(body: unknown): { game: GameId; regionId: RegionId } {
  const input = parseJsonBody<PingTestInput>(body);

  if (typeof input.game !== "string" || typeof input.regionId !== "string") {
    throw new Error("Fields 'game' and 'regionId' are required.");
  }

  const game = getGameById(input.game);
  const region = getRegionById(input.regionId);

  if (!game) {
    throw new Error("Unsupported game.");
  }

  if (!region) {
    throw new Error("Unsupported region.");
  }

  if (!region.supportedGames.includes(game.id)) {
    throw new Error("Selected region does not support this game.");
  }

  return {
    game: game.id,
    regionId: region.id,
  };
}

export function validateAiCoachInput(body: unknown): AiCoachInput {
  const input = parseJsonBody<AiCoachInput>(body);
  const averagePing = Number(input.averagePing);
  const jitter = Number(input.jitter);
  const packetLoss = Number(input.packetLoss);

  if (![averagePing, jitter, packetLoss].every(Number.isFinite)) {
    throw new Error("Fields 'averagePing', 'jitter', and 'packetLoss' must be numbers.");
  }

  if (averagePing < 0 || jitter < 0 || packetLoss < 0) {
    throw new Error("Metrics cannot be negative.");
  }

  return {
    averagePing,
    jitter,
    packetLoss,
  };
}
