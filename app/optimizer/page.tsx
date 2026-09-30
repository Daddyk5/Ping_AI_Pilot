import { requirePageUser } from "@/lib/auth";
import { OptimizerExperience } from "@/components/optimizer/OptimizerExperience";
import { CUSTOM_TARGET_ID, getGame } from "@/lib/games/catalog";

export const metadata = { title: "Game Ping Optimizer · PingPilot AI" };

export default async function OptimizerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, user } = await requirePageUser("/optimizer");
  const { game } = await searchParams;
  let initialGame = typeof game === "string" && (game === CUSTOM_TARGET_ID || getGame(game)) ? game : undefined;

  if (!initialGame) {
    const { data } = await supabase.from("user_settings").select("default_game").eq("user_id", user.id).maybeSingle();
    initialGame = data?.default_game && getGame(data.default_game) ? data.default_game : undefined;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Game Ping Optimizer</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Find your best server region</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Pick a game, test each of its server regions from your own connection, and get a recommendation. Every test is saved to
          your history so you can track connection quality over time.
        </p>
      </section>
      <OptimizerExperience initialGame={initialGame} />
    </div>
  );
}
