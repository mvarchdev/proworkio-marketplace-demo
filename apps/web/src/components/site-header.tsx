import Link from "next/link";

import { Button, Container } from "@proworkio/ui";

const links = [
  { href: "/#ako-to-funguje", label: "Ako to funguje?" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-[#1E1F48]">
          Proworkio
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#1E1F48]/80 transition hover:text-[#1E1F48]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/firma">Som firma</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/zadat-dopyt">Zadať dopyt</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
