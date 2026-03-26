"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellRing,
  BookOpenText,
  Building2,
  FileText,
  Hash,
  MessageSquareWarning,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import { Badge, Button } from "@proworkio/ui";

import { dashboardCopy, resourceConfigs, resourceOrder, type ResourceKey } from "@/lib/admin-data";
import type { AdminShellState } from "@/lib/admin-live-data";

const navIcons: Record<ResourceKey, typeof Users> = {
  users: Users,
  companies: Building2,
  requests: FileText,
  matches: Workflow,
  payments: ReceiptText,
  subscriptions: Sparkles,
  reviews: MessageSquareWarning,
  blog: BookOpenText,
  notifications: BellRing,
  webhooks: Hash,
  auditLogs: ShieldCheck,
};

export function AdminShell({
  children,
  shellState,
}: Readonly<{
  children: ReactNode;
  shellState: AdminShellState;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,221,64,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(46,90,207,0.16),_transparent_26%),linear-gradient(180deg,#070b17_0%,#09101d_38%,#f6f8fe_38%,#eef2ff_100%)] text-[#10192f]">
      <div className="mx-auto grid min-h-screen max-w-[1740px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#08101f]/96 px-4 py-5 text-white backdrop-blur xl:px-6 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#BADD40]">
                Proworkio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin</h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/68">
                {dashboardCopy.description}
              </p>
            </div>
            <Badge variant="accent" className="bg-[#BADD40] text-[#08101f]">
              {shellState.badgeLabel}
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Prevádzka</span>
              <span className="font-medium text-[#E8F3B1]">{shellState.environmentLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Zdroj</span>
              <span className="font-medium text-white">{shellState.sourceLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Mode</span>
              <span className="font-medium text-white">{shellState.modeLabel}</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {resourceOrder.map((key) => {
              const resource = resourceConfigs[key];
              const Icon = navIcons[key];
              const active = pathname === resource.path || pathname.startsWith(`${resource.path}/`);

              return (
                <Link
                  key={resource.key}
                  href={resource.path}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-white text-[#08101f]"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{resource.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Bezpečnostný režim
            </p>
            <p className="mt-2 text-sm leading-6 text-white/80">
              RLS, audit a idempotentné webhooky sú navrhnuté ako predvolený operačný model.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" size="sm" className="bg-white text-[#08101f] hover:bg-white/90">
                <Link href="/audit-logy">Audit</Link>
              </Button>
              <Button asChild variant="primary" size="sm" className="bg-[#BADD40] text-[#08101f] hover:bg-[#d8f36a]">
                <Link href="/webhooky">Webhooks</Link>
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-white/60 bg-white/90 px-4 py-4 backdrop-blur xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#2E5ACF]">
                  Operatívna kontrola
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Prehľad workflowov, integrácií a rizikových miest naprieč Proworkio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted">RLS zapnuté</Badge>
                <Badge variant="muted">Webhooky strážime</Badge>
                <Badge variant="accent" className="bg-[#1E1F48] text-white">
                  {shellState.badgeLabel}
                </Badge>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 xl:px-8 xl:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
