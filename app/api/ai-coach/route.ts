import { createCoachMessage } from "@/lib/ai-coach";
import { isAuthenticationError, requireUser } from "@/lib/auth";
import { validateAiCoachInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireUser();
    const input = validateAiCoachInput(await request.json());

    return Response.json({
      success: true,
      coachMessage: createCoachMessage(input),
    });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return Response.json({ success: false, error: error.message }, { status: 401 });
    }

    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "AI coach failed." },
      { status: 400 },
    );
  }
}
