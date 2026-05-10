import { execFile } from "node:child_process";
import os from "node:os";
import { GAMES, SAFETY_NOTICE } from "@/lib/constants";
import type { DetectedGame, Game, GameId } from "@/types";

const PROCESS_TIMEOUT_MS = 3_000;

const GAME_PROCESS_MAP: Record<GameId, string[]> = {
  valorant: ["valorant.exe", "valorant-win64-shipping.exe", "riotclientservices.exe"],
  dota2: ["dota2.exe", "dota2"],
  warzone: ["cod.exe", "modernwarfare.exe", "bootstrapper.exe"],
  deltaforce: ["deltaforce.exe", "dfgame.exe", "deltaforceclient.exe"],
};

function findKnownGame(processOutput: string): { game: Game; processName: string } | null {
  const normalized = processOutput.toLowerCase();

  for (const game of GAMES) {
    const processName = GAME_PROCESS_MAP[game.id].find((candidate) => normalized.includes(candidate.toLowerCase()));

    if (processName) {
      return { game, processName };
    }
  }

  return null;
}

export async function detectRunningGame(): Promise<DetectedGame> {
  return new Promise((resolve) => {
    const handleProcessList = (error: Error | null, stdout: string) => {
      if (error) {
        resolve({
          detected: false,
          game: null,
          processName: null,
          confidence: "none",
          safetyNotice: SAFETY_NOTICE,
        });
        return;
      }

      const match = findKnownGame(stdout);

      if (!match) {
        resolve({
          detected: false,
          game: null,
          processName: null,
          confidence: "none",
          safetyNotice: SAFETY_NOTICE,
        });
        return;
      }

      resolve({
        detected: true,
        game: match.game,
        processName: match.processName,
        confidence: "high",
        safetyNotice: SAFETY_NOTICE,
      });
    };

    if (os.platform() === "win32") {
      execFile("tasklist", ["/fo", "csv", "/nh"], { timeout: PROCESS_TIMEOUT_MS, windowsHide: true }, handleProcessList);
      return;
    }

    execFile("ps", ["-A", "-o", "comm="], { timeout: PROCESS_TIMEOUT_MS, windowsHide: true }, handleProcessList);
  });
}
