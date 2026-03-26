import type { Metadata } from "next";

import { Card, Container } from "@proworkio/ui";

export const metadata: Metadata = {
  title: "Ochrana súkromia",
};

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <Card className="space-y-6">
        <h1 className="text-4xl font-black text-[#1E1F48]">Ochrana súkromia a GDPR</h1>
        <p className="text-sm leading-8 text-[#1E1F48]/72">
          Kontaktné údaje zákazníkov a interné billing identifikátory sú navrhnuté ako oddelené
          dátové plochy. Verejné a matchovacie dotazy nikdy nesmú vracať privátne kontakty priamo.
        </p>
        <p className="text-sm leading-8 text-[#1E1F48]/72">
          V produkcii je táto stránka určená pre finálne právne znenie, ktoré bude vychádzať z
          reálnych retenčných lehôt, spracovateľov a webhook dodávateľov.
        </p>
      </Card>
    </Container>
  );
}
