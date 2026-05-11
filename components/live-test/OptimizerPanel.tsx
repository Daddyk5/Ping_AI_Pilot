"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Crosshair, Loader2, Radar, ShieldCheck, ShieldQuestion, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GAMES, SAFETY_NOTICE } from "@/lib/constants";
import type { DetectedGame, GameId, PingResult, VpnStatus } from "@/types";

type BoostResponse = {
  recommended: PingResult;
  rankedServers: PingResult[];
  coachMessage: string;
  safetyNotice: string;
  vpnStatus: VpnStatus;
};

export function OptimizerPanel() {
  const [detection, setDetection] = useState<DetectedGame | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameId>("valorant");
  const [isDetecting, setIsDetecting] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<BoostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function detect() {
      setIsDetecting(true);
      try {
        const response = await fetch("/api/detect-game", { cache: "no-store" });
        const payload = (await response.json()) as DetectedGame;

        if (!active) {
          return;
        }

        setDetection(payload);
        if (payload.detected && payload.game) {
          setSelectedGame(payload.game.id);
        }
      } catch {
        if (active) {
          setDetection(null);
        }
      } finally {
        if (active) {
          setIsDetecting(false);
        }
      }
    }

    detect();

    return () => {
      active = false;
    };
  }, []);

  const selectedGameName = useMemo(
    () => GAMES.find((game) => game.id === selectedGame)?.name ?? "Selected game",
    [selectedGame],
  );

  async function runOptimizer() {
    setIsOptimizing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: selectedGame }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Optimizer failed.");
      }

      setResult(payload as BoostResponse);
    } catch (optimizerError) {
      setError(optimizerError instanceof Error ? optimizerError.message : "Optimizer failed.");
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Smart Optimizer</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Detected Game Route Analysis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            PingPilot checks supported game processes, then tests safe predefined regions and recommends the lowest-score route.
          </p>
        </div>
        <Badge tone={detection?.detected ? "green" : "yellow"}>
          {isDetecting ? "Scanning" : detection?.detected ? "Game Detected" : "Manual Select"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded border border-cyan-300/25 bg-cyan-300/10">
              {isDetecting ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-200" aria-hidden />
              ) : (
                <Crosshair className="h-5 w-5 text-cyan-200" aria-hidden />
              )}
            </div>
            <div>
              <p className="font-mono text-sm text-zinc-500">process.scan</p>
              <p className="text-sm text-zinc-200">
                {isDetecting
                  ? "Checking supported game processes"
                  : detection?.detected && detection.game
                    ? `${detection.game.name} detected via ${detection.processName}`
                    : "No supported game process detected"}
              </p>
            </div>
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500" htmlFor="game">
            Game target
          </label>
          <select
            id="game"
            value={selectedGame}
            onChange={(event) => setSelectedGame(event.target.value as GameId)}
            className="mt-2 h-11 w-full rounded border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
          >
            {GAMES.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>

          <Button className="mt-5 w-full" onClick={runOptimizer} disabled={isOptimizing || isDetecting}>
            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Zap className="h-4 w-4" aria-hidden />}
            {isOptimizing ? "Analyzing routes" : `Optimize ${selectedGameName}`}
          </Button>
        </div>

        <div className="rounded border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-lime-200">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Safety lock</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{SAFETY_NOTICE}</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

      {result && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded border border-lime-300/30 bg-lime-300/10 p-4">
            <div className="flex items-center gap-2 text-lime-200">
              <Radar className="h-4 w-4" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Recommended</p>
            </div>
            <p className="mt-4 text-2xl font-semibold text-zinc-50">{result.recommended.region}</p>
            <p className="mt-2 font-mono text-sm text-lime-100">
              {result.recommended.averagePing}ms avg / score {result.recommended.score}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{result.coachMessage}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <ShieldQuestion className="h-4 w-4" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">VPN route awareness</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{result.vpnStatus.summary}</p>
            </div>

            <div className="overflow-hidden rounded border border-white/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-3">Region</th>
                    <th className="px-3 py-3">Average</th>
                    <th className="px-3 py-3">Jitter</th>
                    <th className="px-3 py-3">Loss</th>
                    <th className="px-3 py-3">Score</th>
                    <th className="px-3 py-3">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {result.rankedServers.map((server) => (
                    <tr key={server.regionId} className="hover:bg-white/[0.03]">
                      <td className="px-3 py-3 text-zinc-100">{server.region}</td>
                      <td className="px-3 py-3 font-mono text-cyan-100">{server.averagePing}ms</td>
                      <td className="px-3 py-3 font-mono text-zinc-300">{server.jitter}ms</td>
                      <td className="px-3 py-3 font-mono text-zinc-300">{server.packetLoss}%</td>
                      <td className="px-3 py-3 font-mono text-zinc-300">{server.score}</td>
                      <td className="px-3 py-3">
                        <Badge tone={server.mode === "real" ? "green" : "neutral"}>
                          <Activity className="mr-1 h-3 w-3" aria-hidden />
                          {server.mode}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
