import { supabaseAdmin } from "@/lib/supabase";
import type { PingHistoryRecord, PingResult } from "@/types";

const TABLE = "ping_history";

export function toHistoryRecord(result: PingResult): PingHistoryRecord {
  return {
    game: result.game,
    region: result.region,
    current_ping: result.currentPing,
    average_ping: result.averagePing,
    lowest_ping: result.lowestPing,
    highest_ping: result.highestPing,
    jitter: result.jitter,
    packet_loss: result.packetLoss,
    score: result.score,
    stability: result.stability,
    mode: result.mode,
    created_at: result.createdAt,
  };
}

export async function listHistory() {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").order("created_at", { ascending: false }).limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveHistory(result: PingResult) {
  const { data, error } = await supabaseAdmin.from(TABLE).insert(toHistoryRecord(result)).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteHistory() {
  const { error } = await supabaseAdmin.from(TABLE).delete().not("id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  return { deleted: true };
}
