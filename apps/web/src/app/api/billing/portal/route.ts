import { NextResponse } from "next/server";

import { vipCheckoutSchema } from "@/lib/forms";
import { createBillingPortal } from "@/lib/server-workflows";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = vipCheckoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná požiadavka na billing portal." }, { status: 400 });
  }

  try {
    const url = await createBillingPortal(parsed.data.companyId);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billing portal sa nepodarilo otvoriť." },
      { status: 500 },
    );
  }
}

