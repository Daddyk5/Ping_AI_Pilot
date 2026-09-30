import { notFound } from "next/navigation";
import { AdminView } from "@/components/admin/AdminView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { HistoryExplorer } from "@/components/history/HistoryExplorer";
import { OptimizerExperience } from "@/components/optimizer/OptimizerExperience";
import { SettingsView } from "@/components/settings/SettingsView";
import { PageHeader } from "@/components/ui/Feedback";
import { fixtureAdminStats, fixtureRuns, isDesignPreviewEnabled } from "@/lib/dev/fixtures";
import { DEFAULT_SETTINGS } from "@/lib/settings";

// Development-only design preview: renders signed-in screens with sample data so they can be
// reviewed and screenshotted without an account. 404 in production.
export default async function DesignPreviewPage({ params }: { params: Promise<{ screen: string }> }) {
  if (!isDesignPreviewEnabled()) notFound();
  const { screen } = await params;

  switch (screen) {
    case "dashboard":
      return <DashboardView name="Kenneth" runs={fixtureRuns()} />;
    case "dashboard-empty":
      return <DashboardView name="Kenneth" runs={[]} />;
    case "optimizer":
      return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader title="Game Ping Optimizer" description="Test every server region from your connection and find your best one." />
          <OptimizerExperience initialGame="dota2" />
        </div>
      );
    case "history":
      return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader title="Test history" description="Every test you've run. Filter by game, server region or date." />
          <HistoryExplorer />
        </div>
      );
    case "settings":
      return (
        <SettingsView
          email="kenneth@example.com"
          displayName="Kenneth"
          providers={["email", "google"]}
          createdAt="2026-09-01T00:00:00Z"
          settings={DEFAULT_SETTINGS}
        />
      );
    case "admin":
      return <AdminView stats={fixtureAdminStats} />;
    default:
      notFound();
  }
}
