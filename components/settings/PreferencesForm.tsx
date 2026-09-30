"use client";

import { useState } from "react";
import { AuthAlert } from "@/components/auth/AuthField";
import { Switch } from "@/components/ui/Switch";
import { GAMES, isTestableGame } from "@/lib/games/catalog";
import type { Settings } from "@/lib/settings";

export function PreferencesForm({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function save(next: Settings) {
    const previous = settings;
    setSettings(next);
    setStatus(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save.");
      setSettings(payload.settings as Settings);
      setStatus({ tone: "success", text: "Saved." });
    } catch (saveError) {
      setSettings(previous);
      setStatus({ tone: "error", text: saveError instanceof Error ? saveError.message : "Could not save." });
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Default game in the optimizer
        <select
          value={settings.defaultGame ?? ""}
          onChange={(event) => save({ ...settings, defaultGame: event.target.value || null })}
          className="mt-2 h-11 w-full rounded border border-white/10 bg-zinc-950 px-3 text-sm normal-case tracking-normal text-zinc-100 outline-none focus:border-cyan-300/50"
        >
          <option value="">None (Dota 2)</option>
          {GAMES.filter(isTestableGame).map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-3">
        <Switch
          label="Weekly connection summary email"
          checked={settings.notifyWeeklySummary}
          onCheckedChange={(checked) => save({ ...settings, notifyWeeklySummary: checked })}
        />
        <Switch
          label="Email me when my best route gets noticeably worse"
          checked={settings.notifyDegradation}
          onCheckedChange={(checked) => save({ ...settings, notifyDegradation: checked })}
        />
        <p className="text-xs leading-5 text-zinc-500">
          Email notifications aren&apos;t being sent yet. Your choices are saved and will apply when they launch.
        </p>
      </div>

      {status && <AuthAlert tone={status.tone}>{status.text}</AuthAlert>}
    </div>
  );
}
