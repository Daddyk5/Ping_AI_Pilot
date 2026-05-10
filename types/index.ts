export type GameId = "valorant" | "dota2" | "warzone" | "deltaforce";

export type RegionId = "philippines" | "singapore" | "hongkong" | "japan" | "taiwan" | "us-west";

export type Game = {
  id: GameId;
  name: string;
  category: "FPS" | "MOBA" | "Battle Royale";
};

export type ServerRegion = {
  id: RegionId;
  name: string;
  host: string;
  estimatedBasePing: number;
  supportedGames: GameId[];
};

export type PingMode = "real" | "simulated";

export type Stability = "Excellent" | "Good" | "Fair" | "Poor" | "Unstable";

export type PingResult = {
  success: true;
  mode: PingMode;
  game: GameId;
  region: string;
  regionId: RegionId;
  currentPing: number;
  averagePing: number;
  lowestPing: number;
  highestPing: number;
  jitter: number;
  packetLoss: number;
  score: number;
  stability: Stability;
  createdAt: string;
};

export type PingHistoryRecord = {
  id?: string;
  game: string;
  region: string;
  current_ping: number;
  average_ping: number;
  lowest_ping: number;
  highest_ping: number;
  jitter: number;
  packet_loss: number;
  score: number;
  stability: string;
  mode: PingMode;
  created_at?: string;
};

export type PingTestInput = {
  game: string;
  regionId: string;
};

export type AiCoachInput = {
  averagePing: number;
  jitter: number;
  packetLoss: number;
};

export type ApiError = {
  success: false;
  error: string;
};

export type DetectedGame = {
  detected: boolean;
  game: Game | null;
  processName: string | null;
  confidence: "high" | "medium" | "none";
  safetyNotice: string;
};
