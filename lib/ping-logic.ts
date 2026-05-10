import type { Stability } from "@/types";

export type TelemetryPoint = {
  time: string;
  latency: number;
  jitter: number;
  loss: number;
};

export type SignalStatus = "stable" | "caution" | "loss";

export type ServerRow = {
  name: string;
  latency: number;
  jitter: number;
  stability: number;
  recommendation: "Best" | "Stable" | "Caution" | "Avoid";
};

export function classifySignal(point: Pick<TelemetryPoint, "latency" | "jitter" | "loss">): SignalStatus {
  if (point.loss > 0 || point.latency >= 90) {
    return "loss";
  }

  if (point.jitter >= 12 || point.latency >= 60) {
    return "caution";
  }

  return "stable";
}

export function statusLabel(status: SignalStatus) {
  if (status === "loss") {
    return "Packet Loss";
  }

  if (status === "caution") {
    return "Caution";
  }

  return "Stable";
}

export function nextTelemetryPoint(previous: TelemetryPoint, index: number): TelemetryPoint {
  const drift = Math.round(Math.sin(index / 2) * 7 + Math.cos(index / 3) * 4);
  const latency = Math.max(18, Math.min(112, previous.latency + drift));
  const jitter = Math.max(2, Math.round(Math.abs(drift) + 3 + (index % 7 === 0 ? 7 : 0)));
  const loss = index % 23 === 0 ? 1 : 0;
  const seconds = (index * 5) % 60;

  return {
    time: `01:${seconds.toString().padStart(2, "0")}`,
    latency,
    jitter,
    loss,
  };
}

export function stabilityScore(point: Pick<TelemetryPoint, "latency" | "jitter" | "loss">) {
  return Math.max(0, Math.min(100, Math.round(100 - point.jitter * 2 - point.loss * 28 - point.latency / 5)));
}

export function calculateScore(input: { averagePing: number; jitter: number; packetLoss: number }) {
  return Math.round((input.averagePing + input.jitter * 2 + input.packetLoss * 50) * 100) / 100;
}

export function getStability(input: { averagePing: number; jitter: number; packetLoss: number }): Stability {
  if (input.packetLoss > 2 || input.jitter > 35) {
    return "Unstable";
  }

  if (input.averagePing < 60 && input.jitter < 10 && input.packetLoss === 0) {
    return "Excellent";
  }

  if (input.averagePing < 80 && input.jitter < 16 && input.packetLoss <= 1) {
    return "Good";
  }

  if (input.averagePing < 120 && input.jitter < 25 && input.packetLoss <= 2) {
    return "Fair";
  }

  return "Poor";
}

export function getCoachMessage(input: { averagePing: number; jitter: number; packetLoss: number }) {
  if (input.packetLoss > 2) {
    return "Packet loss detected. Restart your router or check your ISP.";
  }

  if (input.jitter > 20) {
    return "Your connection is unstable. Close downloads or background apps.";
  }

  if (input.averagePing > 100) {
    return "Your latency is high. Try a closer server or use wired connection.";
  }

  if (input.averagePing < 60 && input.jitter < 10) {
    return "Your connection is excellent for competitive gaming.";
  }

  return "Your connection is stable, but another region may improve performance.";
}

export function simulatePingResult(basePing: number) {
  const variance = Math.floor(Math.random() * 18) + 4;
  const lowestPing = Math.max(1, basePing - Math.floor(variance / 2));
  const highestPing = basePing + variance;
  const averagePing = Math.round((lowestPing + highestPing + basePing) / 3);
  const currentPing = Math.round((averagePing + highestPing) / 2);
  const jitter = highestPing - lowestPing;
  const packetLoss = Math.random() > 0.92 ? 1 : 0;

  return {
    currentPing,
    averagePing,
    lowestPing,
    highestPing,
    jitter,
    packetLoss,
  };
}

export function parsePingOutput(output: string) {
  const normalized = output.replace(/\r/g, "");
  const packetLossMatch =
    normalized.match(/(\d+(?:\.\d+)?)%\s*loss/i) ??
    normalized.match(/Lost\s*=\s*\d+\s*\((\d+(?:\.\d+)?)%\s*loss\)/i);
  const packetLoss = packetLossMatch ? Number(packetLossMatch[1]) : 0;

  const windowsStats = normalized.match(/Minimum\s*=\s*(\d+)ms,\s*Maximum\s*=\s*(\d+)ms,\s*Average\s*=\s*(\d+)ms/i);
  if (windowsStats) {
    const lowestPing = Number(windowsStats[1]);
    const highestPing = Number(windowsStats[2]);
    const averagePing = Number(windowsStats[3]);

    return {
      currentPing: averagePing,
      averagePing,
      lowestPing,
      highestPing,
      jitter: Math.max(0, highestPing - lowestPing),
      packetLoss,
    };
  }

  const unixStats = normalized.match(/(?:round-trip|rtt).*?=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)/i);
  if (unixStats) {
    const lowestPing = Math.round(Number(unixStats[1]));
    const averagePing = Math.round(Number(unixStats[2]));
    const highestPing = Math.round(Number(unixStats[3]));
    const jitter = Math.round(Number(unixStats[4]) || highestPing - lowestPing);

    return {
      currentPing: averagePing,
      averagePing,
      lowestPing,
      highestPing,
      jitter,
      packetLoss,
    };
  }

  const replies = Array.from(normalized.matchAll(/(?:time[=<]\s*|time=)(\d+(?:\.\d+)?)\s*ms/gi)).map((match) =>
    Math.round(Number(match[1])),
  );

  if (replies.length > 0) {
    const lowestPing = Math.min(...replies);
    const highestPing = Math.max(...replies);
    const averagePing = Math.round(replies.reduce((sum, value) => sum + value, 0) / replies.length);

    return {
      currentPing: replies[replies.length - 1],
      averagePing,
      lowestPing,
      highestPing,
      jitter: Math.max(0, highestPing - lowestPing),
      packetLoss,
    };
  }

  throw new Error("Unable to parse ping output.");
}
