import type { ServerRow, TelemetryPoint } from "./ping-logic";

export const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { time: "00:00", latency: 34, jitter: 4, loss: 0 },
  { time: "00:05", latency: 31, jitter: 3, loss: 0 },
  { time: "00:10", latency: 36, jitter: 5, loss: 0 },
  { time: "00:15", latency: 42, jitter: 7, loss: 0 },
  { time: "00:20", latency: 38, jitter: 5, loss: 0 },
  { time: "00:25", latency: 33, jitter: 4, loss: 0 },
  { time: "00:30", latency: 35, jitter: 4, loss: 0 },
  { time: "00:35", latency: 37, jitter: 6, loss: 0 },
  { time: "00:40", latency: 44, jitter: 8, loss: 0 },
  { time: "00:45", latency: 40, jitter: 6, loss: 0 },
  { time: "00:50", latency: 32, jitter: 3, loss: 0 },
  { time: "00:55", latency: 35, jitter: 4, loss: 0 },
];

export const SERVER_ROWS: ServerRow[] = [
  {
    name: "Valorant - Oregon Edge",
    latency: 28,
    jitter: 3,
    stability: 98,
    recommendation: "Best",
  },
  {
    name: "Apex Legends - Iowa Relay",
    latency: 42,
    jitter: 7,
    stability: 91,
    recommendation: "Stable",
  },
  {
    name: "Fortnite - Virginia Mesh",
    latency: 55,
    jitter: 13,
    stability: 76,
    recommendation: "Caution",
  },
  {
    name: "League - Chicago POP",
    latency: 64,
    jitter: 22,
    stability: 61,
    recommendation: "Avoid",
  },
];

export const AI_SYSTEM_PROMPT = `Role: You are the 'Lead Flight Engineer' for PingPilot AI.
Tone: Clinical, technical, and alert. Use phrases like 'Telemetry received,' 'Analyzing packet streams,' and 'Bottleneck identified.'
Knowledge Base: You understand bufferbloat, ISP peering, CGNAT issues, and local interference.
Moral Compass: You are strictly an observer. You never promise a 'fix.' If the user's internet is bad, you tell them the hard truth.
Instruction: Filter out all conversational fluff. If the user says 'Thanks,' respond with 'Signal locked. Ready for next test.'`;
