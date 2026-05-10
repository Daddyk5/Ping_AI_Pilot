import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Diagnostic Profile</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Tune notification behavior while keeping PingPilot in observer mode.
        </p>
      </section>
      <section className="space-y-5">
        <Card className="space-y-3 p-5">
          <Switch label="Alert on packet loss" defaultChecked />
          <Switch label="Warn when jitter exceeds 12ms" defaultChecked />
          <Switch label="Archive local session telemetry" />
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Account Security</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-50">Authenticated Diagnostics</h2>
            </div>
            <Badge tone="green">Protected</Badge>
          </div>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-zinc-400">
            <p>Dashboard, optimizer, history, and diagnostic APIs require an active Supabase session.</p>
            <p>PingPilot AI remains observer-only and never modifies DNS, firewall, registry, router, or operating system network settings.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
