import { NextResponse } from "next/server";

import { companyOnboardingSchema } from "@/lib/forms";
import { PublicRouteError, assertPublicSubmissionMeta, assertRateLimit } from "@/lib/security";
import { upsertCompanyWorkflow } from "@/lib/server-workflows";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = companyOnboardingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Neplatný formulár firmy.",
      },
      { status: 400 },
    );
  }

  try {
    assertRateLimit(request, "company-submit", { limit: 6, windowMs: 60_000 });
    assertPublicSubmissionMeta(parsed.data);
    const result = await upsertCompanyWorkflow(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Firmu sa nepodarilo uložiť.",
      },
      { status: error instanceof PublicRouteError ? error.status : 500 },
    );
  }
}
