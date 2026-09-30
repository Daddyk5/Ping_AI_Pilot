import { authenticateRoute } from "@/lib/auth";
import { deleteRuns, listRuns, saveRun } from "@/lib/latency/run-service";
import { formatZodError, pingRunInputSchema, pingRunQuerySchema } from "@/lib/latency/schema";
import { withRequestLog } from "@/lib/logger";
import { consumeRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

/** Save an optimizer run. The body carries raw samples only; the server computes every statistic. */
export async function POST(request: Request) {
  const auth = await authenticateRoute();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  return withRequestLog("POST /api/ping-runs", user.id, async (log) => {
    const limit = await consumeRateLimit(supabase, RATE_LIMITS.pingRuns);
    if (!limit.allowed) {
      log.warn("ping_run.rate_limited", { retryAfterSeconds: limit.retryAfterSeconds });
      return rateLimitResponse(limit, "You're running tests very quickly. Please wait a few minutes.");
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ success: false, error: "Request body too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ success: false, error: "Body must be valid JSON." }, { status: 400 });
    }

    const parsed = pingRunInputSchema.safeParse(body);
    if (!parsed.success) {
      log.info("ping_run.invalid", { issues: parsed.error.issues.length });
      return Response.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    try {
      const run = await saveRun(supabase, user.id, parsed.data);
      log.info("ping_run.saved", {
        runId: run.id,
        gameId: run.gameId,
        targets: run.results.length,
        recommended: run.recommendedTargetId,
        unreachable: run.results.filter((result) => result.score === null).length,
      });
      return Response.json({ success: true, run });
    } catch (error) {
      log.error("ping_run.save_failed", { error, gameId: parsed.data.gameId });
      return Response.json({ success: false, error: "Could not save test results.", requestId: log.requestId }, { status: 503 });
    }
  });
}

export async function GET(request: Request) {
  const auth = await authenticateRoute();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  return withRequestLog("GET /api/ping-runs", user.id, async (log) => {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = pingRunQuerySchema.safeParse(params);
    if (!parsed.success) {
      return Response.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    try {
      const runs = await listRuns(supabase, user.id, parsed.data);
      return Response.json({ success: true, runs });
    } catch (error) {
      log.error("ping_run.list_failed", { error });
      return Response.json({ success: false, error: "Could not load history.", requestId: log.requestId }, { status: 503 });
    }
  });
}

export async function DELETE() {
  const auth = await authenticateRoute();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  return withRequestLog("DELETE /api/ping-runs", user.id, async (log) => {
    try {
      await deleteRuns(supabase, user.id);
      log.info("ping_run.deleted_all");
      return Response.json({ success: true });
    } catch (error) {
      log.error("ping_run.delete_failed", { error });
      return Response.json({ success: false, error: "Could not delete history.", requestId: log.requestId }, { status: 503 });
    }
  });
}
