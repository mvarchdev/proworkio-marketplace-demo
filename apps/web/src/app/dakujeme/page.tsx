import Link from "next/link";

import { Button, Card, Container } from "@proworkio/ui";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const confirm = typeof params.confirm === "string" ? params.confirm : null;
  const claim = typeof params.claim === "string" ? params.claim : null;
  const publicCode = typeof params.publicCode === "string" ? params.publicCode : null;

  return (
    <Container className="py-12">
      <Card className="mx-auto max-w-3xl space-y-6 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Ďakujeme</p>
        <h1 className="text-4xl font-black text-[#1E1F48]">
          Dopyt {publicCode ? <span>{publicCode}</span> : null} je prijatý
        </h1>
        <p className="text-base leading-8 text-[#1E1F48]/70">
          Pred zverejnením ešte potrebujeme potvrdiť e-mailovú adresu. Po potvrdení sa dopyt aktivuje, spustí sa matching firiem a vo firemných dashboardoch sa objaví ako nová príležitosť.
        </p>
        {confirm ? (
          <div className="rounded-2xl border border-[#D9DDF2] bg-[#F8F9FE] p-5 text-sm text-[#1E1F48]/80">
            Lokálny náhľad potvrdenia: <Link href={confirm} className="font-semibold text-[#2E5ACF] underline">potvrdiť dopyt</Link>
          </div>
        ) : null}
        {claim ? (
          <div className="rounded-2xl border border-[#D9DDF2] bg-[#F8F9FE] p-5 text-sm text-[#1E1F48]/80">
            Lokálny claim link: <Link href={claim} className="font-semibold text-[#2E5ACF] underline">prevziať dopyt do účtu</Link>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Späť na homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/dopyty">Prejsť do dashboardu</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}

