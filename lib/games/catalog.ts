// Game Ping Optimizer catalog.
//
// We cannot ping game servers directly from a browser (no ICMP, and game servers don't speak
// HTTPS). Instead each game region maps to a "probe site": an AWS DynamoDB health endpoint
// (`https://dynamodb.<region>.amazonaws.com/ping`) in, or near, the city where the game hosts
// that region. The browser times HTTPS round trips to it. See docs/OPTIMIZER.md.
//
// Game server locations come from publicly available information and change over time.
// `proximity: "nearby"` marks regions where no probe exists in the same city.
// REVIEW THESE MAPPINGS PERIODICALLY.

export type ProbeSiteId =
  | "singapore" | "jakarta" | "kuala-lumpur" | "bangkok" | "hong-kong" | "taipei" | "tokyo" | "seoul"
  | "mumbai" | "sydney" | "uae" | "johannesburg" | "frankfurt" | "stockholm" | "london" | "paris"
  | "ireland" | "milan" | "virginia" | "ohio" | "oregon" | "california" | "montreal" | "sao-paulo" | "mexico";

export type ProbeSite = { id: ProbeSiteId; city: string; awsRegion: string };

export const PROBE_SITES: Record<ProbeSiteId, ProbeSite> = {
  singapore: { id: "singapore", city: "Singapore", awsRegion: "ap-southeast-1" },
  jakarta: { id: "jakarta", city: "Jakarta", awsRegion: "ap-southeast-3" },
  "kuala-lumpur": { id: "kuala-lumpur", city: "Kuala Lumpur", awsRegion: "ap-southeast-5" },
  bangkok: { id: "bangkok", city: "Bangkok", awsRegion: "ap-southeast-7" },
  "hong-kong": { id: "hong-kong", city: "Hong Kong", awsRegion: "ap-east-1" },
  taipei: { id: "taipei", city: "Taipei", awsRegion: "ap-east-2" },
  tokyo: { id: "tokyo", city: "Tokyo", awsRegion: "ap-northeast-1" },
  seoul: { id: "seoul", city: "Seoul", awsRegion: "ap-northeast-2" },
  mumbai: { id: "mumbai", city: "Mumbai", awsRegion: "ap-south-1" },
  sydney: { id: "sydney", city: "Sydney", awsRegion: "ap-southeast-2" },
  uae: { id: "uae", city: "UAE", awsRegion: "me-central-1" },
  johannesburg: { id: "johannesburg", city: "Johannesburg", awsRegion: "af-south-1" },
  frankfurt: { id: "frankfurt", city: "Frankfurt", awsRegion: "eu-central-1" },
  stockholm: { id: "stockholm", city: "Stockholm", awsRegion: "eu-north-1" },
  london: { id: "london", city: "London", awsRegion: "eu-west-2" },
  paris: { id: "paris", city: "Paris", awsRegion: "eu-west-3" },
  ireland: { id: "ireland", city: "Dublin", awsRegion: "eu-west-1" },
  milan: { id: "milan", city: "Milan", awsRegion: "eu-south-1" },
  virginia: { id: "virginia", city: "N. Virginia", awsRegion: "us-east-1" },
  ohio: { id: "ohio", city: "Ohio", awsRegion: "us-east-2" },
  oregon: { id: "oregon", city: "Oregon", awsRegion: "us-west-2" },
  california: { id: "california", city: "N. California", awsRegion: "us-west-1" },
  montreal: { id: "montreal", city: "Montréal", awsRegion: "ca-central-1" },
  "sao-paulo": { id: "sao-paulo", city: "São Paulo", awsRegion: "sa-east-1" },
  mexico: { id: "mexico", city: "Querétaro", awsRegion: "mx-central-1" },
};

export function probeHost(site: ProbeSite) {
  return `dynamodb.${site.awsRegion}.amazonaws.com`;
}

export function probeUrl(site: ProbeSite) {
  return `https://${probeHost(site)}/ping`;
}

export type GameRegion = {
  id: string;
  /** The game's own name for the region/server. */
  name: string;
  /** Where the game's servers for this region are (publicly reported). */
  serverCity: string;
  probe: ProbeSiteId;
  proximity: "same-city" | "nearby";
};

export type GameId = "dota2" | "mlbb" | "deltaforce" | "cs2" | "lol" | "valorant";

export type Game = {
  id: GameId;
  name: string;
  shortName: string;
  /** Monogram badge until licensed logo assets are sourced (see public/games/README.md). */
  monogram: string;
  brandColor: string;
  genre: string;
  comingSoon?: string;
  regions: GameRegion[];
};

const r = (id: string, name: string, serverCity: string, probe: ProbeSiteId, proximity: GameRegion["proximity"] = "same-city"): GameRegion => ({
  id,
  name,
  serverCity,
  probe,
  proximity,
});

// Priority order from the product brief.
export const GAMES: Game[] = [
  {
    id: "dota2",
    name: "Dota 2",
    shortName: "Dota 2",
    monogram: "D2",
    brandColor: "#b8321f",
    genre: "MOBA",
    regions: [
      r("sea", "SE Asia", "Singapore", "singapore"),
      r("hk", "Hong Kong", "Hong Kong", "hong-kong"),
      r("japan", "Japan", "Tokyo", "tokyo"),
      r("india", "India", "Mumbai / Chennai", "mumbai"),
      r("australia", "Australia", "Sydney", "sydney"),
      r("dubai", "Dubai", "Dubai", "uae", "nearby"),
      r("south-africa", "South Africa", "Johannesburg", "johannesburg"),
      r("eu-west", "Europe West", "Luxembourg", "frankfurt", "nearby"),
      r("eu-east", "Europe East", "Vienna", "frankfurt", "nearby"),
      r("russia", "Russia", "Stockholm", "stockholm"),
      r("us-east", "US East", "Sterling, VA", "virginia"),
      r("us-west", "US West", "Seattle", "oregon", "nearby"),
      r("south-america", "South America", "São Paulo", "sao-paulo"),
    ],
  },
  {
    id: "mlbb",
    name: "Mobile Legends: Bang Bang",
    shortName: "MLBB",
    monogram: "ML",
    brandColor: "#1f5fd1",
    genre: "Mobile MOBA",
    regions: [
      r("sea", "Southeast Asia", "Singapore", "singapore"),
      r("indonesia", "Indonesia", "Jakarta", "jakarta"),
      r("malaysia", "Malaysia", "Kuala Lumpur", "kuala-lumpur", "nearby"),
      r("south-asia", "South Asia", "Mumbai", "mumbai", "nearby"),
      r("middle-east", "Middle East", "UAE", "uae", "nearby"),
      r("europe", "Europe", "Frankfurt", "frankfurt", "nearby"),
      r("americas", "Americas", "US East", "virginia", "nearby"),
    ],
  },
  {
    id: "deltaforce",
    name: "Delta Force",
    shortName: "Delta Force",
    monogram: "DF",
    brandColor: "#5d7a2e",
    genre: "Tactical FPS",
    regions: [
      r("asia-sg", "Asia (Singapore)", "Singapore", "singapore"),
      r("asia-hk", "Asia (Hong Kong)", "Hong Kong", "hong-kong"),
      r("asia-jp", "Asia (Tokyo)", "Tokyo", "tokyo"),
      r("oceania", "Oceania", "Sydney", "sydney"),
      r("middle-east", "Middle East", "UAE", "uae", "nearby"),
      r("europe", "Europe", "Frankfurt", "frankfurt"),
      r("na-east", "North America East", "Virginia", "virginia"),
      r("na-west", "North America West", "California", "california"),
      r("south-america", "South America", "São Paulo", "sao-paulo"),
    ],
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    shortName: "CS2",
    monogram: "CS",
    brandColor: "#d98a1f",
    genre: "Tactical FPS",
    regions: [
      r("singapore", "Singapore", "Singapore", "singapore"),
      r("hong-kong", "Hong Kong", "Hong Kong", "hong-kong"),
      r("tokyo", "Tokyo", "Tokyo", "tokyo"),
      r("seoul", "Seoul", "Seoul", "seoul"),
      r("india", "India", "Mumbai / Chennai", "mumbai"),
      r("sydney", "Sydney", "Sydney", "sydney"),
      r("dubai", "Dubai", "Dubai", "uae", "nearby"),
      r("johannesburg", "Johannesburg", "Johannesburg", "johannesburg"),
      r("frankfurt", "Frankfurt", "Frankfurt", "frankfurt"),
      r("stockholm", "Stockholm", "Stockholm", "stockholm"),
      r("london", "London", "London", "london"),
      r("madrid", "Madrid", "Madrid", "paris", "nearby"),
      r("us-east", "US East", "Sterling, VA", "virginia"),
      r("us-central", "US Central", "Chicago", "ohio", "nearby"),
      r("us-west", "US West", "Seattle / Los Angeles", "oregon", "nearby"),
      r("brazil", "Brazil", "São Paulo", "sao-paulo"),
    ],
  },
  {
    id: "lol",
    name: "League of Legends",
    shortName: "LoL",
    monogram: "LoL",
    brandColor: "#c8a24a",
    genre: "MOBA",
    regions: [
      r("na", "North America", "Chicago", "ohio", "nearby"),
      r("euw", "EU West", "Amsterdam", "frankfurt", "nearby"),
      r("eune", "EU Nordic & East", "Amsterdam", "frankfurt", "nearby"),
      r("kr", "Korea", "Seoul", "seoul"),
      r("jp", "Japan", "Tokyo", "tokyo"),
      r("sea", "Southeast Asia", "Singapore", "singapore"),
      r("tw", "Taiwan", "Taipei", "taipei"),
      r("oce", "Oceania", "Sydney", "sydney"),
      r("br", "Brazil", "São Paulo", "sao-paulo"),
      r("lan", "Latin America North", "Miami", "virginia", "nearby"),
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    shortName: "Valorant",
    monogram: "V",
    brandColor: "#e8434f",
    genre: "Tactical FPS",
    comingSoon:
      "Valorant routes traffic through Riot Direct and many regional data centers, so a cloud-endpoint proxy can't reliably predict your in-game ping. We'd rather show nothing than misleading numbers.",
    regions: [],
  },
];

export const CUSTOM_TARGET_ID = "custom";

export function getGame(gameId: string) {
  return GAMES.find((game) => game.id === gameId);
}

export function getRegion(game: Game, regionId: string) {
  return game.regions.find((region) => region.id === regionId);
}

export function isTestableGame(game: Game) {
  return !game.comingSoon && game.regions.length > 0;
}

/** Hostname (or IPv4) with an optional port, no scheme or path. */
const HOST_PATTERN = /^(?=.{1,253}$)((?!-)[a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,63}(:\d{1,5})?$|^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/i;

/** Normalises user input like "https://example.com/path" to "example.com". Returns null if invalid. */
export function normalizeCustomHost(input: string) {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").split(/[/?#]/)[0];
  if (!HOST_PATTERN.test(value)) return null;
  const ipv4 = value.split(":")[0].split(".");
  if (ipv4.length === 4 && ipv4.every((part) => /^\d+$/.test(part)) && ipv4.some((part) => Number(part) > 255)) return null;
  return value;
}

export function customTargetUrl(host: string) {
  return `https://${host}/`;
}
