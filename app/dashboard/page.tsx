import { DashboardView } from "@/components/dashboard/DashboardView";
import { requirePageUser } from "@/lib/auth";
import { daysAgoIso } from "@/lib/format";
import { listRuns } from "@/lib/latency/run-service";
import type { PingRunDto } from "@/lib/latency/types";
import { logger } from "@/lib/logger";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user } = await requirePageUser("/dashboard");
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;

  let runs: PingRunDto[] = [];
  let loadError = false;
  try {
    runs = await listRuns(supabase, user.id, { from: daysAgoIso(30), limit: 100 });
  } catch (error) {
    loadError = true;
    logger.error("dashboard.load_failed", { userId: user.id, error });
  }

  return <DashboardView name={name} runs={runs} loadError={loadError} />;
}
