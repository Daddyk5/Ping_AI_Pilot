"use client";

import { Crosshair } from "lucide-react";
import { GameBadge } from "@/components/games/GameBadge";
import { GAMES, type GameId } from "@/lib/games/catalog";
import { cn } from "@/lib/utils";

export type PickerValue = GameId | "custom";

export function GamePicker({ value, onChange, disabled }: { value: PickerValue; onChange: (value: PickerValue) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Game" className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {GAMES.map((game) => {
        const selected = value === game.id;
        return (
          <button
            key={game.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(game.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              selected ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <GameBadge game={game} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-zinc-100">{game.shortName}</span>
              <span className="block truncate text-xs text-zinc-500">{game.comingSoon ? "Coming soon" : `${game.regions.length} regions`}</span>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        role="radio"
        aria-checked={value === "custom"}
        disabled={disabled}
        onClick={() => onChange("custom")}
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
          value === "custom" ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:border-white/25",
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/15 bg-white/5">
          <Crosshair className="h-4 w-4 text-zinc-300" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-100">Custom</span>
          <span className="block truncate text-xs text-zinc-500">Any HTTPS host</span>
        </span>
      </button>
    </div>
  );
}
