import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { getAllCompanies, getAllRequests, getCategoryBySlug } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  return {
    title: category ? category.name : "Kategória",
    description: category?.shortDescription,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [companies, requests] = await Promise.all([getAllCompanies(), getAllRequests()]);
  const matchingCompanies = companies.filter((company) =>
    company.categories.some((entry) => entry.toLowerCase() === category.name.toLowerCase()),
  );
  const matchingRequests = requests.filter((request) => request.categoryId === category.id);

  return (
    <Container className="space-y-10 py-16">
      <div className="space-y-5">
        <Badge>Kategória</Badge>
        <h1 className="text-5xl font-black tracking-tight text-[#1E1F48]">{category.name}</h1>
        <p className="max-w-3xl text-lg leading-8 text-[#1E1F48]/70">{category.shortDescription}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black text-[#1E1F48]">Aktívne dopyty</h2>
          <div className="mt-5 space-y-4">
            {matchingRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-[#1E1F48]/10 p-4">
                <p className="text-sm font-semibold text-[#2E5ACF]">{request.locationLabel}</p>
                <h3 className="mt-2 text-xl font-black text-[#1E1F48]">{request.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#1E1F48]/70">{request.description}</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={`/dopyty/${request.id}`}>Detail dopytu</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black text-[#1E1F48]">Odporúčané firmy</h2>
          <div className="mt-5 space-y-4">
            {matchingCompanies.map((company) => (
              <div key={company.id} className="rounded-2xl border border-[#1E1F48]/10 p-4">
                <p className="text-sm font-semibold text-[#BADD40]">{company.city}</p>
                <h3 className="mt-2 text-xl font-black text-[#1E1F48]">{company.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[#1E1F48]/70">{company.shortDescription}</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={`/firmy/${company.slug}`}>Profil firmy</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}
