// Deterministic, explainable suggestions computed from a user's test history (no AI model,
// no API key, no cost). Each rule looks at the features and returns at most one suggestion
// backed by the numbers it cites. To add a rule, write a function and add it to RULES.

import type { Features, GameFeature, RegionFeature } from "@/lib/suggestions/features";
import type { Suggestion, SuggestionSet } from "@/lib/suggestions/schema";

const ms = (value: number) => `${Math.round(value)} ms`;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const capitalize = (value: string) => `${value[0].toUpperCase()}${value.slice(1)}`;

/** Differences smaller than this are measurement noise; never tell users to switch over them. */
export const NOISE_MS = 5;

type Rule = (features: Features) => Suggestion | Suggestion[] | null;

export function dataQualityOf(features: Features): SuggestionSet["dataQuality"] {
  if (features.runCount < 3) return "insufficient";
  if (features.runCount < 10 || features.timeOfDay.length < 2) return "limited";
  return "good";
}

const bestRegions = (features: Features) =>
  features.games.map((game) => ({ game, best: game.regions[0] })).filter((entry): entry is { game: GameFeature; best: RegionFeature } => Boolean(entry.best));

/** Best region per game, and whether it clearly beats the runner-up or is effectively tied. */
const bestRegionRule: Rule = (features) =>
  bestRegions(features).map(({ game, best }) => {
    const second = game.regions[1];
    const gap = second ? second.typicalMs - best.typicalMs : null;
    const consistent = best.tests >= 3 && best.timesRecommended >= Math.ceil(best.tests * 0.75);

    let detail: string;
    if (gap !== null && gap <= NOISE_MS) {
      detail = `${best.label} and ${second.label} are within ${ms(gap)} of each other, so pick whichever gives you better matchmaking.`;
    } else if (gap !== null && consistent) {
      detail = `${best.label} has been consistently about ${ms(gap)} faster for you than ${second.label}. Set it as your default region.`;
    } else {
      detail = `${best.label} has been your fastest ${game.gameName} region so far.`;
    }

    return {
      category: "region",
      priority: "high",
      title: `Play ${game.gameName} on ${best.label}`,
      detail,
      evidence: `Typical ${ms(best.typicalMs)} over ${plural(best.tests, "test")}${second ? `; next best ${second.label} ${ms(second.typicalMs)}` : ""}.`,
    } satisfies Suggestion;
  });

/** Jitter clearly worse in one part of the day → congestion at home or at the ISP. */
const timeOfDayRule: Rule = (features) => {
  const buckets = features.timeOfDay.filter((bucket) => bucket.tests >= 2);
  if (buckets.length < 2) return null;
  const worst = buckets.reduce((a, b) => (b.avgJitterMs > a.avgJitterMs ? b : a));
  const calm = buckets.reduce((a, b) => (b.avgJitterMs < a.avgJitterMs ? b : a));
  const latencyWorse = worst.typicalMs - calm.typicalMs;

  if (worst.avgJitterMs >= 8 && worst.avgJitterMs >= calm.avgJitterMs * 2) {
    return {
      category: "time-of-day",
      priority: "medium",
      title: `Your connection is less stable in the ${worst.bucket}`,
      detail: `Jitter spikes in the ${worst.bucket}, which usually means congestion on your home network or at your ISP. Use a wired connection and pause downloads, streams and backups on other devices before playing.`,
      evidence: `${capitalize(worst.bucket)} jitter ${ms(worst.avgJitterMs)} vs ${ms(calm.avgJitterMs)} in the ${calm.bucket}.`,
    };
  }
  if (latencyWorse >= 20) {
    return {
      category: "time-of-day",
      priority: "medium",
      title: `Latency rises in the ${worst.bucket}`,
      detail: `Your best route is noticeably slower in the ${worst.bucket}, a typical sign of peak-hour ISP congestion. If you can, play ranked matches at other times.`,
      evidence: `Typical ${ms(worst.typicalMs)} in the ${worst.bucket} vs ${ms(calm.typicalMs)} in the ${calm.bucket}.`,
    };
  }
  return null;
};

/** Failed or timed-out requests on the best route → unstable link. */
const failuresRule: Rule = (features) => {
  const failing = bestRegions(features).find(({ best }) => best.avgFailurePct >= 2);
  if (!failing) return null;
  return {
    category: "stability",
    priority: "high",
    title: "Some requests are failing on your connection",
    detail: "Requests that time out point to an unstable link, most often weak Wi-Fi or interference. Try a wired connection, or move closer to your router.",
    evidence: `${failing.best.avgFailurePct}% of requests to ${failing.best.label} failed on average.`,
  };
};

/** Slow outliers well above the median → lag spikes, often from other traffic on the network. */
const spikesRule: Rule = (features) => {
  const spiky = bestRegions(features).find(({ best }) => best.avgSpikeMs >= 30 && best.tests >= 2);
  if (!spiky) return null;
  return {
    category: "stability",
    priority: "medium",
    title: "You get occasional lag spikes",
    detail: "Most requests are fast, but some are much slower. That's often caused by uploads or downloads on the same network, such as cloud backups, game updates or video calls. Pause those while playing.",
    evidence: `Slowest requests to ${spiky.best.label} run about ${ms(spiky.best.avgSpikeMs)} above your typical ${ms(spiky.best.typicalMs)}.`,
  };
};

/** Best route getting slower over the window. */
const trendRule: Rule = (features) => {
  const worsening = bestRegions(features).find(({ best }) => (best.trendMs ?? 0) >= 15);
  if (!worsening) return null;
  return {
    category: "region",
    priority: "medium",
    title: `Your latency to ${worsening.best.label} has increased`,
    detail: "Your recent tests are noticeably slower than earlier ones. Restart your router, and if it persists, compare regions again or contact your ISP about routing.",
    evidence: `Typical latency up ${ms(worsening.best.trendMs!)} between your earlier and more recent tests.`,
  };
};

/** Even the best region is far away. */
const distanceRule: Rule = (features) => {
  const far = bestRegions(features).find(({ best }) => best.typicalMs >= 120);
  if (!far) return null;
  return {
    category: "region",
    priority: "low",
    title: `All ${far.game.gameName} regions are far from you`,
    detail: "Even your best region has high latency, so the servers are simply a long way away. A wired connection helps with stability, but distance sets a floor on ping that no setting can remove.",
    evidence: `Best typical latency is ${ms(far.best.typicalMs)} (${far.best.label}).`,
  };
};

/** Compare connection types when the browser reported more than one. */
const connectionRule: Rule = (features) => {
  const known = features.connections.filter((connection) => connection.type !== "unknown" && connection.tests >= 2);
  if (known.length < 2) return null;
  const worst = known.reduce((a, b) => (b.avgJitterMs > a.avgJitterMs ? b : a));
  const best = known.reduce((a, b) => (b.avgJitterMs < a.avgJitterMs ? b : a));
  if (worst.avgJitterMs - best.avgJitterMs < 5) return null;
  return {
    category: "connection",
    priority: "medium",
    title: `Your connection is steadier on ${best.type}`,
    detail: `Tests on ${best.type} have had noticeably less jitter than on ${worst.type}. Use ${best.type} for competitive games when you can.`,
    evidence: `Jitter ${ms(best.avgJitterMs)} on ${best.type} vs ${ms(worst.avgJitterMs)} on ${worst.type}.`,
  };
};

/** Encourage more / fresher data when conclusions are thin. */
const dataRule: Rule = (features) => {
  if (features.daysSinceLastRun !== null && features.daysSinceLastRun >= 7) {
    return {
      category: "data",
      priority: "low",
      title: "Run a fresh test",
      detail: "Your last test was a while ago. Networks and ISP routes change, so a new test keeps these suggestions accurate.",
      evidence: `Last test ${plural(features.daysSinceLastRun, "day")} ago.`,
    };
  }
  if (dataQualityOf(features) !== "good") {
    return {
      category: "data",
      priority: "low",
      title: "Test at different times of day",
      detail: "A few more tests in the morning, afternoon and evening make these suggestions more reliable and reveal peak-hour congestion.",
      evidence: `${plural(features.runCount, "test")} in the last ${features.windowDays} days, covering ${plural(features.timeOfDay.length, "time of day")}.`,
    };
  }
  return null;
};

export const RULES: Rule[] = [bestRegionRule, failuresRule, timeOfDayRule, spikesRule, trendRule, connectionRule, distanceRule, dataRule];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;
export const MAX_SUGGESTIONS = 4;

export function ruleBasedSuggestions(features: Features): SuggestionSet {
  if (features.runCount === 0) {
    return {
      headline: "No tests yet. Run the Game Ping Optimizer to get personalised suggestions.",
      dataQuality: "insufficient",
      suggestions: [],
    };
  }

  const suggestions = RULES.flatMap((rule) => [rule(features) ?? []].flat())
    // Stable sort keeps rule order within the same priority.
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, MAX_SUGGESTIONS);

  const top = bestRegions(features).sort((a, b) => b.game.runs - a.game.runs)[0];
  return {
    headline: top
      ? `Your best ${top.game.gameName} route is ${top.best.label} at a typical ${ms(top.best.typicalMs)}.`
      : "Not enough successful tests to judge your connection yet.",
    dataQuality: dataQualityOf(features),
    suggestions,
  };
}
