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
