import { SettingsView } from "@/components/settings/SettingsView";
import { requirePageUser } from "@/lib/auth";
import { settingsFromRow } from "@/lib/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase, user } = await requirePageUser("/settings");
  const { data: row } = await supabase
    .from("user_settings")
    .select("notify_weekly_summary, notify_degradation, default_game")
    .eq("user_id", user.id)
    .maybeSingle();

  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider ?? "email"];
  const displayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";

  return <SettingsView email={user.email ?? ""} displayName={displayName} providers={providers} createdAt={user.created_at} settings={settingsFromRow(row)} />;
}
