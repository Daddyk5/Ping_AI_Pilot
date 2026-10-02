import { GAME_LOGO_PATHS } from "@/components/games/logos";
import type { Game } from "@/lib/games/catalog";
import { cn } from "@/lib/utils";

// Each game's official mark (bundled from Simple Icons, see ./logos.ts) on its brand colour.
// Games without a bundled mark fall back to a monogram.

function relativeLuminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Picks black or white text, whichever contrasts more with the fill. */
function inkFor(fill: string) {
  const luminance = relativeLuminance(fill);
  return (luminance + 0.05) / 0.05 > 1.05 / (luminance + 0.05) ? "#0b0b0b" : "#ffffff";
}

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
};

const logoSizes = {
  sm: "size-[18px]",
  md: "size-6",
  lg: "size-8",
};

export function GameBadge({ game, size = "md", className }: { game: Pick<Game, "id" | "name" | "monogram" | "brandColor">; size?: keyof typeof sizes; className?: string }) {
  const logoPath = GAME_LOGO_PATHS[game.id];

  return (
    <span
      role="img"
      aria-label={game.name}
      className={cn("grid shrink-0 place-items-center rounded-md font-bold tracking-tight", sizes[size], className)}
      style={{ backgroundColor: game.brandColor, color: inkFor(game.brandColor) }}
    >
      {logoPath ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={cn(logoSizes[size], "fill-current")}>
          <path d={logoPath} />
        </svg>
      ) : (
        game.monogram
      )}
    </span>
  );
}
