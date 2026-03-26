import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { getRequestById } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const request = await getRequestById(id);

  return {
    title: request ? request.title : "Dopyt",
    description: request?.description,
  };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <div className="pb-20">
      <section className="surface-stripes bg-[#EEF0FD]">
        <Container className="space-y-5 py-16">
          <Badge variant="muted">Zverejnený dopyt</Badge>
          <h1 className="max-w-5xl text-balance text-5xl font-black tracking-tight text-[#1E1F48]">
            {request.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-[#1E1F48]/65">
            <span>{request.locationLabel}</span>
            <span>•</span>
            <span>{request.deadlineLabel}</span>
            <span>•</span>
            <span>{request.budgetLabel}</span>
          </div>
        </Container>
      </section>
      <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <Card>
            <h2 className="text-2xl font-black text-[#1E1F48]">Popis projektu</h2>
            <p className="mt-4 text-sm leading-8 text-[#1E1F48]/72">{request.description}</p>
          </Card>
          <Card className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-72 overflow-hidden rounded-[1.25rem]">
              <Image src="/reference/provider-hero-alt.png" alt="Ilustračná fotografia" fill className="object-cover" />
            </div>
            <div className="space-y-4">
              <Badge>Zverejniť dopyt rýchlejšie</Badge>
              <h2 className="text-3xl font-black text-[#1E1F48]">
                Vaše kontakty sú chránené, kým firma neprejde správnym krokom.
              </h2>
              <ul className="space-y-2 text-sm leading-7 text-[#1E1F48]/72">
                <li>Zákazky pod kontrolou v dashboarde</li>
                <li>Kontakt sa odomkne až po webhookom potvrdenej platbe</li>
                <li>Moderácia a audit pri citlivých stavoch</li>
              </ul>
            </div>
          </Card>
        </div>
        <Card className="h-fit bg-[#1E1F48] text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-[#BADD40]">Kontakt na zákazníka</p>
          <p className="mt-5 text-5xl font-black">Oto J.</p>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Kontaktné údaje sú skryté. Odomknutie je dostupné len oprávneným firmám po úspešnej
            platbe alebo pridelení oprávnenia.
          </p>
          <Button variant="accent" className="mt-6 w-full">
            Odomknúť kontakt
          </Button>
        </Card>
      </Container>
    </div>
  );
}
