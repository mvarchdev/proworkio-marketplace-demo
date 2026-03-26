import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@proworkio/ui";

const links = [
  { href: "/dashboard", label: "Prehľad" },
  { href: "/dashboard/dopyty", label: "Moje dopyty" },
  { href: "/dashboard/nastavenia", label: "Nastavenia" },
  { href: "/dashboard/firma", label: "Firma" },
  { href: "/dashboard/firma/prilezitosti", label: "Príležitosti" },
];

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Container className="grid gap-8 py-12 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-3 rounded-[1.5rem] border border-white/60 bg-white/90 p-5 shadow-[0_18px_60px_-32px_rgba(30,31,72,0.28)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Dashboard</p>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-[#1E1F48]/75 transition hover:bg-[#EEF2FF] hover:text-[#1E1F48]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Interná zóna</p>
          <h1 className="mt-2 text-4xl font-black text-[#1E1F48]">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[#1E1F48]/70">{description}</p>
        </div>
        {children}
      </section>
    </Container>
  );
}

