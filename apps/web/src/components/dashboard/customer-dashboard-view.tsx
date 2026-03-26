"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { latestRequests } from "@proworkio/lib";
import { Button, Card } from "@proworkio/ui";

import { readDemoSession } from "@/lib/demo-session";
import { featureFlags } from "@/lib/platform";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function CustomerDashboardView({ mode = "overview" }: { mode?: "overview" | "requests" | "settings" }) {
  const [email, setEmail] = useState<string>(() => readDemoSession()?.email ?? "demo@proworkio.local");
  const [requests, setRequests] = useState(latestRequests);

  useEffect(() => {
    async function loadRequests() {
      if (!featureFlags.hasSupabasePublic) {
        return;
      }

      const supabase = getBrowserSupabaseClient();
      const user = await supabase?.auth.getUser();
      const currentUser = user?.data.user;

      if (!supabase || !currentUser) {
        return;
      }

      setEmail(currentUser.email ?? "demo@proworkio.local");

      const result = await supabase
        .from("requests")
        .select("id, title, description, postal_code, location_label, urgency, status, confirmation_status, created_at, category_id")
        .eq("customer_profile_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!result.error && result.data) {
        setRequests(
          result.data.map((row) => ({
            id: String(row.id),
            categoryId: String(row.category_id),
            title: String(row.title),
            description: String(row.description),
            urgency: row.urgency as "normal" | "fast" | "urgent",
            postalCode: String(row.postal_code),
            locationLabel: String(row.location_label),
            deadlineLabel: "Termín podľa dohody",
            dynamicValues: {},
            photos: [],
            contact: {
              name: "Môj kontakt",
              email: currentUser.email ?? "hidden@proworkio.invalid",
              phone: "",
              preferredChannel: "email",
            },
            termsAccepted: true,
            status: row.status as typeof latestRequests[number]["status"],
            confirmationStatus: row.confirmation_status as typeof latestRequests[number]["confirmationStatus"],
            createdAt: String(row.created_at),
            budgetLabel: "Cena dohodou",
          })),
        );
      }
    }

    void loadRequests();
  }, []);

  if (mode === "settings") {
    return (
      <Card className="space-y-4">
        <h2 className="text-2xl font-black text-[#1E1F48]">Nastavenia účtu</h2>
        <p className="text-sm leading-7 text-[#1E1F48]/70">
          Prihlásený kontakt: <strong>{email}</strong>. Produkčný profil vie cez Supabase Auth meniť heslo, e-mail aj claimovať guest dopyty cez bezpečný token.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {mode === "overview" ? (
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">Moje dopyty</p>
            <p className="mt-3 text-4xl font-black text-[#1E1F48]">{requests.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">Čaká na potvrdenie</p>
            <p className="mt-3 text-4xl font-black text-[#1E1F48]">
              {requests.filter((entry) => entry.confirmationStatus === "pending").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-[#1E1F48]/60">Aktívne</p>
            <p className="mt-3 text-4xl font-black text-[#1E1F48]">
              {requests.filter((entry) => entry.status === "active").length}
            </p>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-[#1E1F48]">Moje dopyty</h2>
          <Button asChild>
            <Link href="/zadat-dopyt">Nový dopyt</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-[#D9DDF2] bg-[#F8F9FE] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#1E1F48]">{request.title}</h3>
                  <p className="text-sm text-[#1E1F48]/65">{request.locationLabel}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1E1F48]/60">
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
