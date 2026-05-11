import { getCoachMessage } from "@/lib/ping-logic";
import { isAuthenticationError, requireUser } from "@/lib/auth";
import { GAMES, getRegionsForGame, SAFETY_NOTICE } from "@/lib/constants";
import { calculateScore, getStability, simulatePingResult } from "@/lib/ping-logic";
import { runRealPing } from "@/lib/real-ping";
import { detectVpnStatus } from "@/lib/vpn-detection";
import type { GameId, PingMode, PingResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = (await request.json()) as { game?: string };
    const game = GAMES.find((item) => item.id === body.game);

    if (!game) {
      return Response.json({ success: false, error: "Unsupported game." }, { status: 400 });
    }

    const testedRegions = getRegionsForGame(game.id as GameId);
    const rankedServers = await Promise.all(
      testedRegions.map(async (region): Promise<PingResult> => {
        let mode: PingMode = "real";
        let metrics: Awaited<ReturnType<typeof runRealPing>>;

        try {
          metrics = await runRealPing(region.host);
        } catch {
          mode = "simulated";
          metrics = simulatePingResult(region.estimatedBasePing);
        }

        return {
          success: true,
          mode,
          game: game.id,
          region: region.name,
          regionId: region.id,
          currentPing: metrics.currentPing,
          averagePing: metrics.averagePing,
          lowestPing: metrics.lowestPing,
          highestPing: metrics.highestPing,
          jitter: metrics.jitter,
          packetLoss: metrics.packetLoss,
          score: calculateScore(metrics),
          stability: getStability(metrics),
          createdAt: new Date().toISOString(),
        };
      }),
    );

    rankedServers.sort((a, b) => a.score - b.score);
    const recommended = rankedServers[0];

    return Response.json({
      recommended,
      rankedServers,
      coachMessage: getCoachMessage(recommended),
      safetyNotice: SAFETY_NOTICE,
      vpnStatus: detectVpnStatus(),
    });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Boost analysis failed." },
      { status: 400 },
    );
  }
}
