import type { Metadata } from "next";

import { Card, Container } from "@proworkio/ui";

export const metadata: Metadata = {
  title: "Obchodné podmienky",
};

export default function TermsPage() {
  return (
    <Container className="py-16">
      <Card className="space-y-6">
        <h1 className="text-4xl font-black text-[#1E1F48]">Obchodné podmienky</h1>
        <p className="text-sm leading-8 text-[#1E1F48]/72">
          Táto stránka je pripravená pre finálne obchodné a platobné podmienky, vrátane unlock
          pravidiel, VIP predplatného, refund politiky a moderácie obsahu.
        </p>
      </Card>
    </Container>
  );
}
