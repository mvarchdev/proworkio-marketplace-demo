import type { Metadata } from "next";

import { Card, Container } from "@proworkio/ui";

export const metadata: Metadata = {
  title: "Cookies",
};

export default function CookiesPage() {
  return (
    <Container className="py-16">
      <Card className="space-y-6">
        <h1 className="text-4xl font-black text-[#1E1F48]">Používanie cookies</h1>
        <p className="text-sm leading-8 text-[#1E1F48]/72">
          Produkt používa technické cookies pre relácie, preferencie a bezpečnostné opatrenia. Po
          nasadení analytiky budú marketingové a analytické cookies riadené cez samostatné súhlasy.
        </p>
      </Card>
    </Container>
  );
}
