// Chart tokens for the app's dark surface (~#0c0c0e). Categorical slots 1-3 are validated
// all-pairs against that surface (CVD ΔE ≥ 9.4, normal-vision ΔE ≥ 20.9, contrast ≥ 3:1).
// Assign series in this order; never cycle or generate extra hues.

export const chartColors = {
  series: ["#3987e5", "#d95926", "#199e70"] as const,
  /** De-emphasised marks when one series/bar is the point. */
  context: "#4a4a47",
  grid: "#2c2c2a",
  axis: "#383835",
  textPrimary: "#ffffff",
  textSecondary: "#c3c2b7",
  textMuted: "#898781",
  surface: "#0c0c0e",
};

export const statusColors = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const axisProps = {
  stroke: chartColors.axis,
  tick: { fill: chartColors.textMuted, fontSize: 11 },
  tickLine: false,
} as const;

export const formatMs = (value: number | null | undefined) => (value == null ? "—" : `${Math.round(value)} ms`);
