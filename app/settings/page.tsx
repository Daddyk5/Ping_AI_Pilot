import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AccountForm } from "@/components/settings/AccountForm";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { Card } from "@/components/ui/Card";
import { requirePageUser } from "@/lib/auth";
import { settingsFromRow } from "@/lib/settings";

export const metadata = { title: "Settings · PingPilot AI" };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      <div className="max-w-lg">{children}</div>
    </Card>
  );
}

export default async function SettingsPage() {
  const { supabase, user } = await requirePageUser("/settings");
  const { data: row } = await supabase
    .from("user_settings")
    .select("notify_weekly_summary, notify_degradation, default_game")
    .eq("user_id", user.id)
    .maybeSingle();

  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider ?? "email"];
  const displayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Account &amp; preferences</h1>
      </div>

      <Section title="Account" description={`Signed in with ${providers.join(" and ")}. Member since ${new Date(user.created_at).toLocaleDateString()}.`}>
        <AccountForm email={user.email ?? ""} displayName={displayName} />
      </Section>

      <Section
        title="Password"
        description={providers.includes("email") ? "Change the password you use to log in." : "Add a password so you can also log in with your email address."}
      >
        <ResetPasswordForm redirectTo={null} submitLabel="Update password" />
      </Section>

      <Section title="Preferences & notifications" description="Changes save automatically.">
        <PreferencesForm initial={settingsFromRow(row)} />
      </Section>

      <Section title="Your data" description="Your test history is private. Only you can see it.">
        <p className="text-sm leading-6 text-zinc-400">
          You can delete your full test history from the History page. To delete your account entirely, contact support.
        </p>
      </Section>
    </div>
  );
}
