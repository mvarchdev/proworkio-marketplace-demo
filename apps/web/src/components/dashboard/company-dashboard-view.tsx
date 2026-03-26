"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { explainMatch, featuredCompanies, latestRequests, leadUnlockPrice } from "@proworkio/lib";
import { Button, Card } from "@proworkio/ui";

import { featureFlags } from "@/lib/platform";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

interface OpportunityCard {
  id: string;
  requestId: string;
  title: string;
  locality: string;
  budgetLabel: string;
  score: number;
  status: string;
}

export function CompanyDashboardView({ mode = "overview" }: { mode?: "overview" | "opportunities" }) {
  const demoCompany = featuredCompanies[0];
  const [companyName, setCompanyName] = useState(featuredCompanies[0]?.name ?? "Vaša firma");
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>(
    latestRequests.map((request) => ({
      id: request.id,
      requestId: request.id,
      title: request.title,
      locality: request.locationLabel,
      budgetLabel: request.budgetLabel ?? "Cena dohodou",
      score:
        demoCompany
          ? explainMatch(request, { ...demoCompany, location: { lat: 48.1486, lng: 17.1477 } }).score
          : 0,
      status: "available",
    })),
  );

  useEffect(() => {
    async function loadCompanyData() {
      if (!featureFlags.hasSupabasePublic) {
        return;
      }

      const supabase = getBrowserSupabaseClient();
      const user = await supabase?.auth.getUser();
      const currentUser = user?.data.user;

      if (!supabase || !currentUser) {
        return;
      }

      const membership = await supabase
        .from("company_members")
        .select("company_id, companies(display_name)")
        .eq("profile_id", currentUser.id)
        .limit(1)
        .maybeSingle();

      const companyId = membership.data?.company_id ? String(membership.data.company_id) : null;
      const companyLabel = (membership.data?.companies as { display_name?: string } | null)?.display_name;
      if (companyLabel) {
        setCompanyName(companyLabel);
      }

      if (!companyId) {
        return;
      }

      const matches = await supabase
        .from("request_company_matches")
        .select("id, status, score, requests(id, title, location_label, budget_min_cents, budget_max_cents)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (!matches.error && matches.data) {
        setOpportunities(
          matches.data.map((row) => {
            const related = Array.isArray(row.requests) ? row.requests[0] : row.requests;
            const request = related as unknown as Record<string, unknown> | null;
            const budgetMin = Number(request?.budget_min_cents ?? 0) / 100;
            const budgetMax = Number(request?.budget_max_cents ?? 0) / 100;
            return {
              id: String(row.id),
              requestId: String(request?.id ?? row.id),
              title: String(request?.title ?? "Dopyt"),
              locality: String(request?.location_label ?? "Lokalita"),
              budgetLabel: budgetMax ? `${budgetMin} – ${budgetMax} €` : "Cena dohodou",
              score: Number(row.score ?? 0),
              status: String(row.status ?? "available"),
            };
          }),
        );
      }
    }

    void loadCompanyData();
  }, []);

  async function startCheckout(requestId: string) {
    const response = await fetch("/api/payments/lead-unlock/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: "current", requestId }),
    });

    const payload = (await response.json()) as { url?: string; error?: string };
    if (payload.url) {
      window.location.assign(payload.url);
    }
  }

  async function startVip() {
    const response = await fetch("/api/billing/vip/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: "current" }),
    });

    const payload = (await response.json()) as { url?: string };
    if (payload.url) {
      window.location.assign(payload.url);
    }
  }

  return (
    <div className="space-y-6">
      {mode === "overview" ? (
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">Firma</p>
            <p className="mt-3 text-2xl font-black text-[#1E1F48]">{companyName}</p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">Matchnuté príležitosti</p>
            <p className="mt-3 text-4xl font-black text-[#1E1F48]">{opportunities.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">VIP profil</p>
            <Button className="mt-4" onClick={() => void startVip()}>
              Aktivovať VIP
            </Button>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#1E1F48]">
              {mode === "opportunities" ? "Zhodné príležitosti" : "Prehľad firmy"}
            </h2>
            <p className="mt-2 text-sm text-[#1E1F48]/65">
              Lead unlock je účtovaný až po úspešnej platbe potvrdenej webhookom.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/registracia-firmy">Upraviť profil</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="rounded-2xl border border-[#D9DDF2] bg-[#F8F9FE] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#1E1F48]">{opportunity.title}</h3>
                  <p className="text-sm text-[#1E1F48]/65">
                    {opportunity.locality} • skóre {opportunity.score} / 100 • {opportunity.budgetLabel}
                  </p>
                </div>
                <Button onClick={() => void startCheckout(opportunity.requestId)}>
                  Odomknúť kontakt za {leadUnlockPrice.amountCents / 100} €
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
