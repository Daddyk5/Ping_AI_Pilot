import { authenticateRoute } from "@/lib/auth";
import { formatZodError } from "@/lib/latency/schema";
import { withRequestLog } from "@/lib/logger";
import { settingsFromRow, settingsSchema } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const auth = await authenticateRoute();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  return withRequestLog("PUT /api/settings", user.id, async (log) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ success: false, error: "Body must be valid JSON." }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: user.id,
        notify_weekly_summary: parsed.data.notifyWeeklySummary,
        notify_degradation: parsed.data.notifyDegradation,
        default_game: parsed.data.defaultGame,
        updated_at: new Date().toISOString(),
      })
      .select("notify_weekly_summary, notify_degradation, default_game")
      .single();

    if (error) {
      log.error("settings.save_failed", { message: error.message });
      return Response.json({ success: false, error: "Could not save settings.", requestId: log.requestId }, { status: 503 });
    }

    return Response.json({ success: true, settings: settingsFromRow(data) });
  });
}
