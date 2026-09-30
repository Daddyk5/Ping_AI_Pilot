import type { ReactNode } from "react";
import { Bell, Database, KeyRound, UserRound } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AccountForm } from "@/components/settings/AccountForm";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Feedback";
import type { Settings } from "@/lib/settings";

function Section({ id, icon, title, description, children }: { id: string; icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-4 border-b border-line py-8 first:pt-0 last:border-none lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg [&_svg]:size-4 [&_svg]:text-accent">
          {icon}
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-fg-3">{description}</p>
      </div>
      <Card className="max-w-xl p-5 sm:p-6">{children}</Card>
    </section>
  );
}

const providerLabel = (provider: string) => (provider === "email" ? "email" : provider[0].toUpperCase() + provider.slice(1));

export function SettingsView({
  email,
  displayName,
  providers,
  createdAt,
  settings,
}: {
  email: string;
  displayName: string;
  providers: string[];
  createdAt: string;
  settings: Settings;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Settings" description="Manage your account, password and preferences." />

      <Section
        id="account"
        icon={<UserRound />}
        title="Account"
        description={`Signed in with ${providers.map(providerLabel).join(" and ")} · member since ${new Date(createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}.`}
      >
        <AccountForm email={email} displayName={displayName} />
      </Section>

      <Section
        id="password"
        icon={<KeyRound />}
        title="Password"
        description={providers.includes("email") ? "Change the password you use to log in." : "Add a password so you can also log in with your email address."}
      >
        <ResetPasswordForm redirectTo={null} submitLabel="Update password" compact />
      </Section>

      <Section id="preferences" icon={<Bell />} title="Preferences" description="Changes save automatically.">
        <PreferencesForm initial={settings} />
      </Section>

      <Section id="data" icon={<Database />} title="Your data" description="Your test history is private. Only you can see it.">
        <p className="text-sm leading-6 text-fg-2">You can review or delete your full test history from the History page. To delete your account entirely, contact support.</p>
        <ButtonLink href="/history" variant="secondary" size="sm" className="mt-4">
          Open history
        </ButtonLink>
      </Section>
    </div>
  );
}
