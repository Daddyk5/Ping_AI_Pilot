import { describe, expect, it } from "vitest";
import { GAMES, isTestableGame, normalizeCustomHost, PROBE_SITES } from "@/lib/games/catalog";
import { pingRunInputSchema } from "@/lib/latency/schema";

describe("catalog integrity", () => {
  it("lists the v1 games in brief priority order", () => {
    expect(GAMES.map((game) => game.id)).toEqual(["dota2", "mlbb", "deltaforce", "cs2", "lol", "valorant"]);
  });

  it("stubs Valorant as coming soon rather than shipping proxy numbers", () => {
    const valorant = GAMES.find((game) => game.id === "valorant")!;
    expect(isTestableGame(valorant)).toBe(false);
  });

  it("maps every region to a known probe site with unique ids per game", () => {
    for (const game of GAMES) {
      const ids = game.regions.map((region) => region.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const region of game.regions) {
        expect(PROBE_SITES[region.probe], `${game.id}/${region.id}`).toBeDefined();
      }
    }
  });
});

describe("normalizeCustomHost", () => {
  it.each([
    ["example.com", "example.com"],
    ["HTTPS://Example.com/path?q=1", "example.com"],
    ["api.example.co.uk:8443", "api.example.co.uk:8443"],
    ["1.2.3.4", "1.2.3.4"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeCustomHost(input)).toBe(expected);
  });

  it.each(["", "localhost", "not a host", "999.1.1.1", "-bad.com", "javascript:alert(1)"])("rejects %j", (input) => {
    expect(normalizeCustomHost(input)).toBeNull();
  });
});

describe("pingRunInputSchema", () => {
  const valid = { gameId: "dota2", targets: [{ targetId: "sea", samples: [30, 31, null] }] };

  it("accepts a valid run", () => {
    expect(pingRunInputSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["unknown game", { ...valid, gameId: "fortnite" }],
    ["coming-soon game", { gameId: "valorant", targets: [{ targetId: "x", samples: [1] }] }],
    ["region from another game", { gameId: "dota2", targets: [{ targetId: "euw", samples: [1] }] }],
    ["duplicate region", { gameId: "dota2", targets: [{ targetId: "sea", samples: [1] }, { targetId: "sea", samples: [1] }] }],
    ["negative sample", { gameId: "dota2", targets: [{ targetId: "sea", samples: [-1] }] }],
    ["absurd sample", { gameId: "dota2", targets: [{ targetId: "sea", samples: [60_000] }] }],
    ["too many samples", { gameId: "dota2", targets: [{ targetId: "sea", samples: Array(31).fill(10) }] }],
    ["custom without host", { gameId: "custom", targets: [{ targetId: "custom", samples: [1] }] }],
    ["game region in a custom run", { gameId: "custom", targets: [{ targetId: "sea", samples: [1] }] }],
  ])("rejects %s", (_label, input) => {
    expect(pingRunInputSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a custom-host run", () => {
    const input = { gameId: "custom", targets: [{ targetId: "custom", customHost: "example.com", samples: [20] }] };
    expect(pingRunInputSchema.safeParse(input).success).toBe(true);
  });
});
