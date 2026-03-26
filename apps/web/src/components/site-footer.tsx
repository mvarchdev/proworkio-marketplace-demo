import Link from "next/link";

import { Container } from "@proworkio/ui";

const columns = [
  {
    title: "Pre zákazníkov",
    links: [
      { href: "/zadat-dopyt", label: "Zadať dopyt" },
      { href: "/faq", label: "Časté otázky" },
      { href: "/blog", label: "Inšpirácie a rady" },
    ],
  },
  {
    title: "Pre firmy",
    links: [
      { href: "/dashboard/firma", label: "Firemný dashboard" },
      { href: "/dashboard/firma/prilezitosti", label: "Spárované príležitosti" },
      { href: "/obchodne-podmienky", label: "Obchodné podmienky" },
    ],
  },
  {
    title: "Právne a bezpečnosť",
    links: [
      { href: "/ochrana-sukromia", label: "Ochrana súkromia" },
      { href: "/cookies", label: "Cookies" },
      { href: "/obchodne-podmienky", label: "Podmienky služby" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#1E1F48] text-white">
      <Container className="grid gap-14 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="text-3xl font-black">Proworkio</p>
            <p className="mt-3 max-w-sm text-sm text-white/70">
              Za posledný mesiac sme pomohli desiatkam firiem nájsť relevantné dopyty
              a zákazníkom zrýchliť výber overeného dodávateľa.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#BADD40]">Aktívne čísla</p>
            <p className="mt-4 text-5xl font-black">236</p>
            <p className="mt-2 text-sm text-white/70">zverejnených dopytov práve teraz</p>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
              {column.title}
            </h2>
            <ul className="space-y-3 text-sm text-white/80">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-white/10 py-5 text-xs text-white/55">
        © 2026 Proworkio. Všetky práva vyhradené.
      </Container>
    </footer>
  );
}
