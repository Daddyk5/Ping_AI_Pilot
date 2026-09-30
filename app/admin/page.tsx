import { notFound } from "next/navigation";
import { AdminView, type AdminStats } from "@/components/admin/AdminView";
import { Alert } from "@/components/ui/Feedback";
import { isAdmin, requirePageUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const { supabase, user } = await requirePageUser("/admin");

  // 404 rather than 403 so the page's existence isn't revealed to non-admins.
  // The SQL function re-checks the role claim, so this is not the only gate.
  if (!isAdmin(user)) notFound();

  const { data, error } = await supabase.rpc("admin_usage_stats");
  if (error || !data) {
    logger.error("admin.stats_failed", { userId: user.id, message: error?.message });
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Alert tone="error" title="Couldn't load usage stats">
          {error?.message ?? "No data returned."}
        </Alert>
      </div>
    );
  }

  return <AdminView stats={data as AdminStats} />;
}
