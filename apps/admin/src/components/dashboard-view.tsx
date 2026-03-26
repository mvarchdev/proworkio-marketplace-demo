import { ArrowUpRight, CheckCircle2, Clock3, ShieldAlert, Sparkles } from "lucide-react";

import { Badge, Card } from "@proworkio/ui";

import { resourceConfigs } from "@/lib/admin-data";
import type { DashboardViewModel } from "@/lib/admin-live-data";
import { PageHeader } from "./page-header";

function toneClass(tone: "accent" | "muted" | "dark") {
  if (tone === "accent") {
    return "border-[#BADD40]/30 bg-[#F5FAD6] text-[#1E1F48]";
  }

  if (tone === "dark") {
    return "border-[#1E1F48]/20 bg-[#1E1F48] text-white";
  }

  return "border-slate-200 bg-white text-[#1E1F48]";
}

function StatTile({ label, value, note, tone }: { label: string; value: string; note: string; tone: "accent" | "muted" | "dark" }) {
  return (
    <Card className={`space-y-3 border px-5 py-5 ${toneClass(tone)}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{label}</p>
        <Sparkles className="h-4 w-4 opacity-60" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm leading-6 opacity-75">{note}</p>
    </Card>
  );
}

function FeedItem({ title, detail, time, tone }: { title: string; detail: string; time: string; tone: "accent" | "muted" | "dark" }) {
  return (
    <div className={`flex items-start gap-3 rounded-3xl border p-4 ${toneClass(tone)}`}>
      <div className="mt-1 rounded-full bg-white/70 p-2">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{title}</p>
          <span className="text-xs opacity-60">{time}</span>
        </div>
        <p className="mt-1 text-sm leading-6 opacity-80">{detail}</p>
      </div>
    </div>
  );
}

export function DashboardView({
  metrics,
  queues,
  feed,
  resourceHighlights,
  requestsCount,
  companiesCount,
  paymentsCount,
  notificationsCount,
  webhooksCount,
  headerBadge,
  priorityCount,
}: DashboardViewModel) {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operatívny prehľad"
        title="Prevádzkový panel"
        description="Na jednom mieste sledujeme nové dopyty, schvaľovanie firiem, webhooky, platby a fallbacky notifikácií."
        action={{ label: "Otvoriť dopyty", href: "/dopyty", variant: "primary" }}
        badge={headerBadge}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatTile key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="space-y-5 border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#2E5ACF]">Prioritné fronty</p>
              <h3 className="mt-1 text-xl font-semibold text-[#0f172a]">Čo treba riešiť teraz</h3>
            </div>
            <Badge variant="accent" className="bg-[#BADD40] text-[#08101f]">
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              {priorityCount} kritické
            </Badge>
          </div>

          <div className="grid gap-3">
            {queues.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <Badge variant={item.tone === "accent" ? "accent" : item.tone === "dark" ? "dark" : "muted"}>
                    {item.tone === "accent" ? "Priorita" : item.tone === "dark" ? "Incident" : "Na sledovanie"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{requestsCount}</p>
              <p className="mt-1 text-sm text-slate-600">aktívne alebo čakajúce</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Companies</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{companiesCount}</p>
              <p className="mt-1 text-sm text-slate-600">v procese schválenia</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payments</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{paymentsCount}</p>
              <p className="mt-1 text-sm text-slate-600">ledger položky</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2E5ACF]">Systémové signály</p>
                <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">Integrácie a doručovanie</h3>
              </div>
              <Clock3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Webhook backlog</span>
                <span className="font-semibold text-slate-900">{webhooksCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Notifikačné attempts</span>
                <span className="font-semibold text-slate-900">{notificationsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Active billing states</span>
                <span className="font-semibold text-slate-900">{paymentsCount}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2E5ACF]">Event feed</p>
                <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">Najnovšie udalosti</h3>
              </div>
              <ShieldAlert className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {feed.map((entry) => (
                <FeedItem key={`${entry.title}-${entry.time}`} {...entry} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2E5ACF]">Resource health</p>
            <h3 className="mt-1 text-lg font-semibold text-[#0f172a]">Prehľad plnej mapy sekcií</h3>
          </div>
          <Badge variant="muted">Pripravené</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.values(resourceConfigs).map((resource) => (
            <div key={resource.key} className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-900">{resource.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{resource.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {resourceHighlights[resource.key] ?? resource.signals[0]?.value ?? "0"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
