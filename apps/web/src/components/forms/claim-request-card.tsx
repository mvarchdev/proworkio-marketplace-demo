"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Card } from "@proworkio/ui";

import { writeDemoSession } from "@/lib/demo-session";
import { featureFlags } from "@/lib/platform";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type ClaimState = "idle" | "loading" | "needs-auth" | "success" | "error";

export function ClaimRequestCard({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<ClaimState>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(
    token ? "Overujem možnosť prevzatia dopytu..." : "Chýba token pre prevzatie dopytu.",
  );

  const performClaim = useCallback(async () => {
    setState("loading");
    setMessage("Preberám dopyt do vášho účtu...");

    const response = await fetch("/api/requests/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          requestId?: string | null;
          error?: string;
        }
      | null;

    if (!response.ok) {
      if (response.status === 401) {
        setState("needs-auth");
        setMessage(payload?.error ?? "Na pokračovanie sa musíte prihlásiť.");
        return;
      }

      setState("error");
      setMessage(payload?.error ?? "Dopyt sa nepodarilo prevziať.");
      return;
    }

    setState("success");
    setMessage("Dopyt je úspešne prepojený s vaším účtom.");
  }, [token]);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        return;
      }

      if (!featureFlags.hasSupabasePublic) {
        setState("idle");
        setMessage("Používate lokálny demo režim. Dopyt môžete prevziať do demo účtu jedným klikom.");
        return;
      }

      const supabase = getBrowserSupabaseClient();
      const user = await supabase?.auth.getUser();
      if (!user?.data.user) {
        setState("needs-auth");
        setMessage("Najprv sa prihláste alebo dokončite registráciu.");
        return;
      }

      await performClaim();
    }

    void bootstrap();
  }, [performClaim, token]);

  return (
    <Card className="mx-auto max-w-2xl space-y-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Prevzatie dopytu</p>
        <h1 className="mt-2 text-3xl font-black text-[#1E1F48]">Priradenie guest dopytu k účtu</h1>
      </div>

      <p className="text-base leading-8 text-[#1E1F48]/70">{message}</p>

      <div className="flex flex-wrap gap-3">
        {state === "needs-auth" ? (
          <>
            <Button asChild>
              <Link href={`/prihlasenie?claimToken=${encodeURIComponent(token)}`}>Prihlásiť sa</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/registracia?claimToken=${encodeURIComponent(token)}`}>Vytvoriť účet</Link>
            </Button>
          </>
        ) : null}

        {state === "idle" ? (
          <Button
            onClick={() => {
              writeDemoSession({
                role: "customer",
                email: "demo@proworkio.local",
                fullName: "Demo používateľ",
              });
              void performClaim().then(() => {
                router.push("/dashboard/dopyty");
              });
            }}
          >
            Aktivovať demo účet a prevziať dopyt
          </Button>
        ) : null}

        {state === "success" ? (
          <>
            <Button asChild>
              <Link href="/dashboard/dopyty">Otvoriť moje dopyty</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </>
        ) : null}

        {state === "error" ? (
          <Button onClick={() => void performClaim()}>Skúsiť znova</Button>
        ) : null}
      </div>
    </Card>
  );
}
