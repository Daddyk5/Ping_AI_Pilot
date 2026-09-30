import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryMock } from "../helpers/supabase-mock";

vi.mock("@/lib/auth", () => ({ authenticateRoute: vi.fn() }));
vi.mock("@/lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rate-limit")>()),
  consumeRateLimit: vi.fn(),
}));

const { authenticateRoute } = await import("@/lib/auth");
const { consumeRateLimit } = await import("@/lib/rate-limit");
const { GET, POST } = await import("@/app/api/ping-runs/route");

const USER = { id: "user-1" };

function signIn(result?: Parameters<typeof createQueryMock>[0]) {
  const mock = createQueryMock(result);
  vi.mocked(authenticateRoute).mockResolvedValue({ ok: true, supabase: mock.client, user: USER } as never);
  return mock;
}

const post = (body: unknown) =>
  POST(new Request("http://test/api/ping-runs", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

beforeEach(() => {
  vi.mocked(authenticateRoute).mockReset();
  vi.mocked(consumeRateLimit).mockResolvedValue({ allowed: true, remaining: 10, retryAfterSeconds: 0 });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/ping-runs", () => {
  it("returns 401 when signed out", async () => {
    vi.mocked(authenticateRoute).mockResolvedValue({ ok: false, response: Response.json({}, { status: 401 }) } as never);
    expect((await post({})).status).toBe(401);
  });

  it("rejects malformed JSON and invalid input with 400", async () => {
    signIn();
    expect((await post("{not json")).status).toBe(400);
    const response = await post({ gameId: "dota2", targets: [{ targetId: "sea", samples: [-5] }] });
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/targets/);
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    signIn();
    vi.mocked(consumeRateLimit).mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 120 });
    const response = await post({ gameId: "dota2", targets: [{ targetId: "sea", samples: [30] }] });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
  });

  it("rejects oversized bodies with 413", async () => {
    signIn();
    expect((await post("x".repeat(70_000))).status).toBe(413);
  });

  it("recomputes stats server-side and ignores client-supplied labels/hosts", async () => {
    const { calls } = signIn([
      {
        data: { id: "run-1", game_id: "dota2", samples_per_target: 3, recommended_target_id: "sea", connection_type: null, created_at: "2026-09-30T00:00:00Z" },
        error: null,
      },
      { data: [], error: null },
    ]);

    const response = await post({
      gameId: "dota2",
      targets: [
        { targetId: "sea", samples: [30, 32, 31], targetLabel: "HACKED", endpointHost: "evil.com" },
        { targetId: "us-east", samples: [220, 221, null] },
      ],
    });
    expect(response.status).toBe(200);

    const inserts = calls.filter(([method]) => method === "insert").map(([, args]) => args[0]);
    expect(inserts[0]).toMatchObject({ user_id: USER.id, game_id: "dota2", recommended_target_id: "sea", samples_per_target: 3 });

    const results = inserts[1] as Array<Record<string, unknown>>;
    expect(results[0]).toMatchObject({
      target_id: "sea",
      target_label: "SE Asia",
      endpoint_host: "dynamodb.ap-southeast-1.amazonaws.com",
      median_ms: 31,
      failed: 0,
      user_id: USER.id,
    });
    expect(results[1]).toMatchObject({ target_id: "us-east", failed: 1, failure_rate: 0.333 });
  });
});

describe("GET /api/ping-runs", () => {
  it("validates query params", async () => {
    signIn();
    const response = await GET(new Request("http://test/api/ping-runs?limit=9999"));
    expect(response.status).toBe(400);
  });

  it("scopes to the user and filters by game", async () => {
    const { calls } = signIn({ data: [], error: null });
    const response = await GET(new Request("http://test/api/ping-runs?gameId=cs2&limit=10"));
    expect(response.status).toBe(200);
    expect(calls).toContainEqual(["eq", ["user_id", USER.id]]);
    expect(calls).toContainEqual(["eq", ["game_id", "cs2"]]);
    expect(calls).toContainEqual(["limit", [10]]);
  });
});
