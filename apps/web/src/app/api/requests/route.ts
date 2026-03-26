import { NextResponse } from "next/server";

import { requestFormSchema } from "@/lib/forms";
import { PublicRouteError, assertPublicSubmissionMeta, assertRateLimit } from "@/lib/security";
import { submitGuestRequestWorkflow } from "@/lib/server-workflows";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Neplatný formulár dopytu.",
      },
      { status: 400 },
    );
  }

  try {
    assertRateLimit(request, "request-submit", { limit: 10, windowMs: 60_000 });
    assertPublicSubmissionMeta(parsed.data);
    const result = await submitGuestRequestWorkflow(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Dopyt sa nepodarilo odoslať.",
      },
      { status: error instanceof PublicRouteError ? error.status : 500 },
    );
  }
}
