"use client";

import { Crosshair } from "lucide-react";
import { GameBadge } from "@/components/games/GameBadge";
import { GAMES, type GameId } from "@/lib/games/catalog";
import { cn } from "@/lib/utils";

export type PickerValue = GameId | "custom";

function Tile({ selected, disabled, onClick, children }: { selected: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-accent/60 bg-accent-soft ring-1 ring-accent/40" : "border-line bg-surface-2 hover:border-line-strong hover:bg-surface-3",
      )}
    >
      {children}
    </button>
  );
}

export function GamePicker({ value, onChange, disabled }: { value: PickerValue; onChange: (value: PickerValue) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Game" className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {GAMES.map((game) => (
        <Tile key={game.id} selected={value === game.id} disabled={disabled} onClick={() => onChange(game.id)}>
          <GameBadge game={game} size="sm" className={cn(game.comingSoon && "opacity-50 grayscale")} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">{game.shortName}</span>
            <span className="block truncate text-xs text-fg-3">{game.comingSoon ? "Coming soon" : `${game.regions.length} regions`}</span>
          </span>
        </Tile>
      ))}
      <Tile selected={value === "custom"} disabled={disabled} onClick={() => onChange("custom")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line-strong bg-surface-3">
          <Crosshair className="size-4 text-fg-2" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-fg">Custom</span>
          <span className="block truncate text-xs text-fg-3">Any HTTPS host</span>
        </span>
      </Tile>
    </div>
  );
}
