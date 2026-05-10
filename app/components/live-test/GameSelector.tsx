"use client";

import { useState } from "react";
import { Crosshair, Gamepad2, RadioTower } from "lucide-react";
import { Badge } from "@/app/components/Ui/Badge";
import { cn } from "@/app/lib/utils";

const games = [
  { name: "Valorant", region: "US-West", route: "Oregon Edge", latency: 28 },
  { name: "Apex Legends", region: "US-Central", route: "Iowa Relay", latency: 42 },
  { name: "Fortnite", region: "US-East", route: "Virginia Mesh", latency: 55 },
];

export function GameSelector() {
  const [selected, setSelected] = useState(games[0].name);

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-4 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Target Game</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-50">Server Profile</h2>
        </div>
        <Gamepad2 className="h-5 w-5 text-cyan-200" aria-hidden />
      </div>

      <div className="grid gap-3">
        {games.map((game) => {
          const active = selected === game.name;

          return (
            <button
              key={game.name}
              type="button"
              onClick={() => setSelected(game.name)}
              className={cn(
                "flex items-center justify-between gap-4 rounded border p-3 text-left transition",
                active
                  ? "border-cyan-300/45 bg-cyan-300/10 shadow-[0_0_18px_rgba(0,243,255,0.14)]"
                  : "border-white/10 bg-white/[0.03] hover:border-cyan-300/25",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-white/10 bg-black/30">
                  {active ? (
                    <Crosshair className="h-4 w-4 text-cyan-200" aria-hidden />
                  ) : (
                    <RadioTower className="h-4 w-4 text-zinc-500" aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-100">{game.name}</span>
                  <span className="block truncate font-mono text-xs text-zinc-500">
                    {game.region} / {game.route}
                  </span>
                </span>
              </span>
              <Badge tone={active ? "green" : "neutral"}>{game.latency}ms</Badge>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default GameSelector;
