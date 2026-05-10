import { deleteHistory, listHistory, saveHistory } from "@/lib/history-service";
import { isAuthenticationError, requireUser } from "@/lib/auth";
import type { PingResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const history = await listHistory();
    return Response.json({ success: true, history });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to load history." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser();
    const result = (await request.json()) as PingResult;

    if (!result?.success || typeof result.game !== "string" || typeof result.region !== "string") {
      return Response.json({ success: false, error: "A valid ping result is required." }, { status: 400 });
    }

    const saved = await saveHistory(result);
    return Response.json({ success: true, history: saved });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to save history." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  try {
    await requireUser();
    const result = await deleteHistory();
    return Response.json({ success: true, ...result });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to delete history." },
      { status: 503 },
    );
  }
}
