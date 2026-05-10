import { getRegionById } from "@/lib/constants";
import { isAuthenticationError, requireUser } from "@/lib/auth";
import { calculateScore, getStability, simulatePingResult } from "@/lib/ping-logic";
import { runRealPing } from "@/lib/real-ping";
import { validatePingTestInput } from "@/lib/validation";
import type { PingMode, PingResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireUser();
    const input = validatePingTestInput(await request.json());
    const region = getRegionById(input.regionId);

    if (!region) {
      return Response.json({ success: false, error: "Unsupported region." }, { status: 400 });
    }

    let mode: PingMode = "real";
    let metrics: Awaited<ReturnType<typeof runRealPing>>;

    try {
      metrics = await runRealPing(region.host);
    } catch {
      mode = "simulated";
      metrics = simulatePingResult(region.estimatedBasePing);
    }

    const score = calculateScore(metrics);
    const result: PingResult = {
      success: true,
      mode,
      game: input.game,
      region: region.name,
      regionId: region.id,
      currentPing: metrics.currentPing,
      averagePing: metrics.averagePing,
      lowestPing: metrics.lowestPing,
      highestPing: metrics.highestPing,
      jitter: metrics.jitter,
      packetLoss: metrics.packetLoss,
      score,
      stability: getStability(metrics),
      createdAt: new Date().toISOString(),
    };

    return Response.json(result);
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Ping test failed." },
      { status: 400 },
    );
  }
}
