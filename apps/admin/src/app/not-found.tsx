import Link from "next/link";

import { Badge, Button, Card } from "@proworkio/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl space-y-6 border border-slate-200 bg-white p-8 text-center">
        <Badge variant="muted" className="bg-slate-100 text-slate-700">
          404
        </Badge>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Stránka sa nenašla
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600">
            Požadovaný panel alebo detail momentálne neexistuje. Vráť sa na prehľad alebo otvor audit
            a pokračuj odtiaľ.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link href="/">Späť na prehľad</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/audit-logy">Otvoriť audit logy</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
