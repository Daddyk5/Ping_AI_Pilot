import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeRun } from "../helpers/runs";

vi.mock("@/lib/auth", () => ({ authenticateRoute: vi.fn() }));
vi.mock("@/lib/latency/run-service", () => ({ listRuns: vi.fn() }));

const { authenticateRoute } = await import("@/lib/auth");
const { listRuns } = await import("@/lib/latency/run-service");
const { GET } = await import("@/app/api/suggestions/route");

const get = (query: string) => GET(new Request(`http://test/api/suggestions${query}`));

beforeEach(() => {
  vi.mocked(authenticateRoute).mockResolvedValue({ ok: true, supabase: {}, user: { id: "u1" } } as never);
  vi.mocked(listRuns).mockReset().mockResolvedValue([makeRun("2026-09-29T08:00:00Z", { sea: [40, 41, 40] })]);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("GET /api/suggestions", () => {
  it("returns 401 when signed out", async () => {
    vi.mocked(authenticateRoute).mockResolvedValue({ ok: false, response: Response.json({}, { status: 401 }) } as never);
    expect((await get("")).status).toBe(401);
  });

  it("returns rule-based suggestions for a game, scoped to that game", async () => {
    const response = await get("?scope=dota2&timeZone=Asia/Manila");
    expect(response.status).toBe(200);
    const { suggestions } = await response.json();
    expect(suggestions).toMatchObject({ scope: "dota2", basedOnRuns: 1 });
    expect(suggestions.suggestions[0].title).toBe("Play Dota 2 on SEA");
    expect(vi.mocked(listRuns).mock.calls[0][2]).toMatchObject({ gameId: "dota2" });
  });

  it("queries all games for the overview", async () => {
    await get("?scope=overview");
    expect(vi.mocked(listRuns).mock.calls[0][2].gameId).toBeUndefined();
  });

  it("rejects unknown scopes", async () => {
    expect((await get("?scope=fortnite")).status).toBe(400);
    expect((await get("?scope=Bad%20Scope")).status).toBe(400);
  });
});
