import { requirePageUser } from "@/lib/auth";
import { OptimizerExperience } from "@/components/optimizer/OptimizerExperience";
import { PageHeader } from "@/components/ui/Feedback";
import { CUSTOM_TARGET_ID, getGame } from "@/lib/games/catalog";

export const metadata = { title: "Game Ping Optimizer" };

export default async function OptimizerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, user } = await requirePageUser("/optimizer");
  const { game } = await searchParams;
  let initialGame = typeof game === "string" && (game === CUSTOM_TARGET_ID || getGame(game)) ? game : undefined;

  if (!initialGame) {
    const { data } = await supabase.from("user_settings").select("default_game").eq("user_id", user.id).maybeSingle();
    initialGame = data?.default_game && getGame(data.default_game) ? data.default_game : undefined;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Game Ping Optimizer" description="Test every server region from your own connection and find your best one. Each test is saved so you can track your connection over time." />
      <OptimizerExperience initialGame={initialGame} />
    </div>
  );
}
