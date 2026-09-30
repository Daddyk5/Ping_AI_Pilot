import { fixtureRuns, fixtureSuggestions, isDesignPreviewEnabled } from "@/lib/dev/fixtures";

// Development-only JSON fixtures for design-preview screenshots. 404 in production.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!isDesignPreviewEnabled()) return new Response("Not found", { status: 404 });
  const { name } = await params;

  if (name === "ping-runs") return Response.json({ success: true, runs: fixtureRuns() });
  if (name === "ping-runs-empty") return Response.json({ success: true, runs: [] });
  if (name === "suggestions") return Response.json({ success: true, suggestions: fixtureSuggestions() });
  return new Response("Not found", { status: 404 });
}
