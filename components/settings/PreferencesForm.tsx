"use client";

import { useState } from "react";
import { AuthAlert } from "@/components/auth/AuthField";
import { Field, Select } from "@/components/ui/Field";
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
    <div className="space-y-5">
      <Field label="Default game in the optimizer" hint="The optimizer opens on this game.">
        <Select value={settings.defaultGame ?? ""} onChange={(event) => save({ ...settings, defaultGame: event.target.value || null })}>
          <option value="">None (Dota 2)</option>
          {GAMES.filter(isTestableGame).map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </Select>
      </Field>

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
        <p className="text-xs leading-5 text-fg-3">
          Email notifications aren&apos;t being sent yet. Your choices are saved and will apply when they launch.
        </p>
      </div>

      {status && <AuthAlert tone={status.tone}>{status.text}</AuthAlert>}
    </div>
  );
}
