import type { Game, GameId, ServerRegion } from "@/types";

export const GAMES: Game[] = [
  {
    id: "valorant",
    name: "Valorant",
    category: "FPS",
  },
  {
    id: "dota2",
    name: "Dota 2",
    category: "MOBA",
  },
  {
    id: "warzone",
    name: "Call of Duty: Warzone",
    category: "Battle Royale",
  },
  {
    id: "deltaforce",
    name: "Delta Force",
    category: "FPS",
  },
];

export const SERVER_REGIONS: ServerRegion[] = [
  {
    id: "philippines",
    name: "Philippines",
    host: "ph.pool.ntp.org",
    estimatedBasePing: 42,
    supportedGames: ["dota2", "deltaforce"],
  },
  {
    id: "singapore",
    name: "Singapore",
    host: "sg.pool.ntp.org",
    estimatedBasePing: 38,
    supportedGames: ["valorant", "dota2", "warzone", "deltaforce"],
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    host: "hk.pool.ntp.org",
    estimatedBasePing: 45,
    supportedGames: ["valorant", "dota2", "warzone", "deltaforce"],
  },
  {
    id: "japan",
    name: "Japan",
    host: "jp.pool.ntp.org",
    estimatedBasePing: 58,
    supportedGames: ["valorant", "dota2", "warzone", "deltaforce"],
  },
  {
    id: "taiwan",
    name: "Taiwan",
    host: "tw.pool.ntp.org",
    estimatedBasePing: 48,
    supportedGames: ["dota2", "deltaforce"],
  },
  {
    id: "us-west",
    name: "US West",
    host: "us.pool.ntp.org",
    estimatedBasePing: 138,
    supportedGames: ["valorant", "dota2", "warzone"],
  },
];

export const PING_SAMPLE_COUNT = 4;

export const PING_TIMEOUT_MS = 7_500;

export const SAFETY_NOTICE =
  "PingPilot AI does not change DNS, firewall, registry, router, or system network settings. It only analyzes connection quality and provides safe recommendations.";

export function getGameById(gameId: string) {
  return GAMES.find((game) => game.id === gameId);
}

export function getRegionById(regionId: string) {
  return SERVER_REGIONS.find((region) => region.id === regionId);
}

export function getRegionsForGame(gameId: GameId) {
  return SERVER_REGIONS.filter((region) => region.supportedGames.includes(gameId));
}
