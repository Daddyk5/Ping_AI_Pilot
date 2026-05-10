import { detectRunningGame } from "@/lib/game-detection";
import { isAuthenticationError, requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const detection = await detectRunningGame();
    return Response.json(detection);
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json({ success: false, error: "Unable to detect running game." }, { status: 500 });
  }
}
