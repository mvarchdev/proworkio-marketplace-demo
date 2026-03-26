import Link from "next/link";

import { Button, Card, Container } from "@proworkio/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70svh] items-center justify-center py-20">
      <Card className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2E5ACF]">404</p>
        <h1 className="mt-6 text-4xl font-black text-[#1E1F48]">
          Táto stránka už u nás nemá svoju zákazku.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#1E1F48]/70">
          Skontrolujte odkaz alebo sa vráťte na hlavnú stránku. Verejné detailné stránky
          dopytov a profilov sa môžu meniť podľa stavu moderácie.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="primary">
            <Link href="/">Späť na Proworkio</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
