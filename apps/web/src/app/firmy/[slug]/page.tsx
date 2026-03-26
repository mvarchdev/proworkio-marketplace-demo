import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { getCompanyBySlug, getCompanyReviews } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  return {
    title: company ? company.name : "Profil firmy",
    description: company?.shortDescription,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const companyReviews = await getCompanyReviews(company.id);

  return (
    <div className="pb-20">
      <section className="surface-stripes bg-[#EEF0FD]">
        <Container className="grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem]">
            {company.heroImageUrl ? (
              <Image src={company.heroImageUrl} alt={company.name} fill className="object-cover" />
            ) : null}
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {company.vip ? <Badge>VIP profil</Badge> : <Badge variant="muted">Overená firma</Badge>}
              <Badge variant="dark">{company.rating100} / 100</Badge>
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-black tracking-tight text-[#1E1F48]">
                {company.name}
              </h1>
              <p className="text-lg leading-8 text-[#1E1F48]/70">{company.longDescription}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[#1E1F48]/70">
              <span>{company.city}</span>
              <span>•</span>
              <span>Dosah {company.radiusKm} km</span>
              <span>•</span>
              <span>{company.reviewsCount} overených recenzií</span>
            </div>
            <Button variant="primary">Požiadať o kontakt cez dopyt</Button>
          </div>
        </Container>
      </section>
      <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <Card>
            <h2 className="text-2xl font-black text-[#1E1F48]">Služby a oblasti</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {company.categories.map((category) => (
                <Badge key={category} variant="muted">
                  {category}
                </Badge>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-2xl font-black text-[#1E1F48]">Recenzie</h2>
            <div className="mt-5 space-y-4">
              {companyReviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-[#1E1F48]/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-[#1E1F48]">{review.title}</h3>
                    <Badge>{review.rating100} / 100</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#1E1F48]/72">{review.body}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#1E1F48]/48">
                    {review.authorName}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card className="h-fit bg-[#1E1F48] text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-[#BADD40]">VIP výhody</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/72">
            <li>Galéria realizácií a bohatší profil</li>
            <li>Viditeľné recenzie a lepšia prezentácia</li>
            <li>Príprava na budúce premium moduly</li>
          </ul>
        </Card>
      </Container>
    </div>
  );
}
