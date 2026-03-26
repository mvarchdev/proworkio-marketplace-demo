import { Badge, Card } from "@proworkio/ui";

import {
  type BadgeCell,
  type CellValue,
} from "@/lib/admin-data";
import type { ResourceViewModel } from "@/lib/admin-live-data";
import { PageHeader } from "./page-header";

function toneToClass(tone?: BadgeCell["tone"]) {
  if (tone === "accent") {
    return "bg-[#BADD40] text-[#08101f]";
  }

  if (tone === "dark") {
    return "bg-[#1E1F48] text-white";
  }

  return "bg-[#EEF0FD] text-[#1E1F48]";
}

function renderCell(value: CellValue) {
  if (typeof value === "string" || typeof value === "number") {
    return <span className="text-sm font-medium text-slate-900">{value}</span>;
  }

  return (
    <Badge variant="muted" className={toneToClass(value.tone)}>
      {value.label}
    </Badge>
  );
}

export function ResourceView({ config, rows, signals, badgeLabel, surfaceLabel }: ResourceViewModel) {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        action={config.primaryAction}
        badge={badgeLabel}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden border border-slate-200 bg-white p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
            <div>
              <p className="text-sm font-semibold text-[#2E5ACF]">Aktuálny výrez</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Záznamy pripravené pre operátora</h3>
            </div>
            <Badge variant="muted" className="bg-slate-100 text-slate-700">
              {surfaceLabel}
            </Badge>
          </div>

          <div className="grid gap-3 border-b border-slate-200 px-6 py-5 md:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal.label} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">{signal.label}</p>
                  <Badge variant={signal.tone === "accent" ? "accent" : signal.tone === "dark" ? "dark" : "muted"} className={toneToClass(signal.tone)}>
                    {signal.tone === "accent" ? "OK" : signal.tone === "dark" ? "Risk" : "Watch"}
                  </Badge>
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{signal.value}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{signal.note}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            {rows.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-base font-semibold text-slate-900">Zatiaľ bez záznamov</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Hosted projekt je pripravený, ale táto sekcia ešte nemá seed alebo produkčné udalosti.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {config.columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 ${column.className ?? ""}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/70">
                      {config.columns.map((column) => (
                        <td key={column.key} className={`px-5 py-4 align-top ${column.className ?? ""}`}>
                          {renderCell(row[column.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 border border-slate-200 bg-white p-6">
            <div>
              <p className="text-sm font-semibold text-[#2E5ACF]">Čo sledovať</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Operatívne poznámky</h3>
            </div>
            <div className="space-y-3">
              {config.notes.map((note) => (
                <div key={note.title} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="font-medium text-slate-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{note.body}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border border-slate-200 bg-white p-6">
            <div>
              <p className="text-sm font-semibold text-[#2E5ACF]">Základný workflow</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Čo sa deje ďalej</h3>
            </div>
            <ol className="space-y-3">
              <li className="rounded-3xl border border-slate-200 px-4 py-4">
                <p className="font-medium text-slate-900">1. Validácia vstupu</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Všetky citlivé operácie prechádzajú cez bezpečné stavy a audit.
                </p>
              </li>
              <li className="rounded-3xl border border-slate-200 px-4 py-4">
                <p className="font-medium text-slate-900">2. Stavová zmena</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Schválenie, publish alebo payout sa zapisuje do ledgeru ako jednorazový event.
                </p>
              </li>
              <li className="rounded-3xl border border-slate-200 px-4 py-4">
                <p className="font-medium text-slate-900">3. Vedľajšie efekty</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Notifikácie, invoice sync a webhook retry sú spracované oddelene.
                </p>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </section>
  );
}
