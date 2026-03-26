import Link from "next/link";

import { Button, Card, Container } from "@proworkio/ui";

import { featureFlags } from "@/lib/platform";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

export default async function ConfirmRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  let success = false;
  let message = "Neplatný alebo expirovaný potvrzovací odkaz.";

  if (token && token.startsWith("demo-")) {
    success = true;
    message = "Lokálne demo potvrdenie bolo úspešné.";
  } else if (token && featureFlags.hasSupabaseService) {
    const supabase = getServiceSupabaseClient();
    const result = await supabase?.rpc("confirm_request", { raw_token: token });
    if (!result?.error) {
      success = true;
      message = "Dopyt bol potvrdený a zaradený do matching pipeline.";
    }
  }

  return (
    <Container className="py-12">
      <Card className="mx-auto max-w-2xl space-y-5 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Potvrdenie dopytu</p>
        <h1 className="text-4xl font-black text-[#1E1F48]">{success ? "Dopyt je aktívny" : "Potvrdenie zlyhalo"}</h1>
        <p className="text-base leading-8 text-[#1E1F48]/70">{message}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/dopyty">Moje dopyty</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Späť na homepage</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}

