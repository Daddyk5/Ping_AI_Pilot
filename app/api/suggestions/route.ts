import { authenticateRoute } from "@/lib/auth";
import { getGame } from "@/lib/games/catalog";
import { formatZodError } from "@/lib/latency/schema";
import { withRequestLog } from "@/lib/logger";
import { isValidTimeZone } from "@/lib/suggestions/features";
import { suggestionRequestSchema } from "@/lib/suggestions/schema";
import { getSuggestions } from "@/lib/suggestions/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/suggestions?scope=overview|<gameId>&timeZone=Area/City */
export async function GET(request: Request) {
  const auth = await authenticateRoute();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  return withRequestLog("GET /api/suggestions", user.id, async (log) => {
    const parsed = suggestionRequestSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!parsed.success) {
      return Response.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { scope } = parsed.data;
    if (scope !== "overview" && scope !== "custom" && !getGame(scope)) {
      return Response.json({ success: false, error: "Unknown scope." }, { status: 400 });
    }
    const timeZone = isValidTimeZone(parsed.data.timeZone) ? parsed.data.timeZone : "UTC";

    try {
      const suggestions = await getSuggestions(supabase, user.id, { scope, timeZone });
      return Response.json({ success: true, suggestions });
    } catch (error) {
      log.error("suggestions.failed", { error, scope });
      return Response.json({ success: false, error: "Could not load suggestions.", requestId: log.requestId }, { status: 503 });
    }
  });
}
