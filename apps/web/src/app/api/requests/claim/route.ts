import { NextResponse } from "next/server";
import { z } from "zod";

import { PublicRouteError, assertRateLimit } from "@/lib/security";
import { getRequestSupabaseClient } from "@/lib/supabase/server";

const claimSchema = z.object({
  token: z.string().min(1, "Chýba claim token."),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "claim-request", { limit: 12, windowMs: 60_000 });

    const payload = await request.json().catch(() => null);
    const parsed = claimSchema.safeParse(payload);

    if (!parsed.success) {
      throw new PublicRouteError(parsed.error.issues[0]?.message ?? "Neplatný claim token.", 400);
    }

    if (parsed.data.token.startsWith("demo-")) {
      return NextResponse.json({
        success: true,
        requestId: parsed.data.token.replace(/^demo-/, ""),
        mode: "demo",
      });
    }

    const supabase = await getRequestSupabaseClient();
    const user = await supabase?.auth.getUser();
    if (!supabase || !user?.data.user) {
      throw new PublicRouteError("Na prevzatie dopytu sa musíte prihlásiť.", 401);
    }

    const { data, error } = await supabase.rpc("claim_guest_request", {
      raw_token: parsed.data.token,
    });

    if (error) {
      throw new PublicRouteError(error.message, 400);
    }

    const requestRow = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      requestId: requestRow?.id ? String(requestRow.id) : null,
      mode: "database",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Dopyt sa nepodarilo prevziať.",
      },
      { status: error instanceof PublicRouteError ? error.status : 500 },
    );
  }
}

