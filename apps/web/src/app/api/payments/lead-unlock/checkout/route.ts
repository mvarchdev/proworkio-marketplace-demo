import { NextResponse } from "next/server";

import { checkoutSchema } from "@/lib/forms";
import { startLeadUnlockCheckout } from "@/lib/server-workflows";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná požiadavka na odomknutie." }, { status: 400 });
  }

  try {
    const result = await startLeadUnlockCheckout(parsed.data.companyId, parsed.data.requestId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout sa nepodarilo pripraviť." },
      { status: 500 },
    );
  }
}

