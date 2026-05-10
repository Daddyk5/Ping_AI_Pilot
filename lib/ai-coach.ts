import { getCoachMessage } from "@/lib/ping-logic";

export function createCoachMessage(input: { averagePing: number; jitter: number; packetLoss: number }) {
  return getCoachMessage(input);
}
