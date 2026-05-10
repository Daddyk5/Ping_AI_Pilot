import { GAMES, getRegionsForGame, SERVER_REGIONS } from "@/lib/constants";
import { isAuthenticationError, requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();

    const supportedRegionsByGame = Object.fromEntries(
      GAMES.map((game) => [
        game.id,
        getRegionsForGame(game.id).map((region) => ({
          id: region.id,
          name: region.name,
          estimatedBasePing: region.estimatedBasePing,
        })),
      ]),
    );

    return Response.json({
      games: GAMES,
      regions: SERVER_REGIONS.map((region) => ({
        id: region.id,
        name: region.name,
        estimatedBasePing: region.estimatedBasePing,
        supportedGames: region.supportedGames,
      })),
      supportedRegionsByGame,
    });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json({ success: false, error: "Unable to load servers." }, { status: 500 });
  }
}
