import { NextResponse } from "next/server";

import { vipCheckoutSchema } from "@/lib/forms";
import { startVipCheckout } from "@/lib/server-workflows";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = vipCheckoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná požiadavka na VIP checkout." }, { status: 400 });
  }

  try {
    const result = await startVipCheckout(parsed.data.companyId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "VIP checkout sa nepodarilo pripraviť." },
      { status: 500 },
    );
  }
}

