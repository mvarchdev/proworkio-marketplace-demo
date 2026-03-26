import type { Metadata } from "next";

import { Card, Container } from "@proworkio/ui";

import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "FAQ",
};

const items = [
  {
    q: "Kto vidí kontaktné údaje zákazníka?",
    a: "Len oprávnená firma po úspešne spracovanej platbe alebo inom schválenom unlock oprávnení. Verejný detail dopytu zostáva anonymizovaný.",
  },
  {
    q: "Ako funguje párovanie firiem?",
    a: "Párovanie vyhodnocuje kategóriu, subkategórie a servisný dosah. Výsledok je auditovateľný a vysvetliteľný v admin rozhraní.",
  },
  {
    q: "Čo získam ako VIP firma?",
    a: "VIP plán pridáva bohatší profil, galériu realizácií, viditeľné recenzie a priestor pre budúce premium moduly.",
  },
];

export default function FaqPage() {
  return (
    <Container className="space-y-10 py-16">
      <SectionHeading
        eyebrow="FAQ"
        title="Najčastejšie otázky o fungovaní Proworkio"
        description="Stránka je pripravená pre SEO aj používateľskú dôveru. V produkcii by ju admin tím vedel dopĺňať z obsahu alebo nastavení."
      />
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.q}>
            <h2 className="text-2xl font-black text-[#1E1F48]">{item.q}</h2>
            <p className="mt-4 text-sm leading-8 text-[#1E1F48]/72">{item.a}</p>
          </Card>
        ))}
      </div>
    </Container>
  );
}
