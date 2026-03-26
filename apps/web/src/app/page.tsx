import Image from "next/image";
import Link from "next/link";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { SectionHeading } from "@/components/section-heading";
import { getHomepageSnapshot } from "@/lib/site";

export default async function Home() {
  const snapshot = await getHomepageSnapshot();

  return (
    <div className="pb-24">
      <section className="surface-stripes overflow-hidden bg-[#EEF0FD]">
        <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="reveal-up space-y-8">
            <Badge>Marketplace pre reálne zákazky</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-balance text-5xl font-black tracking-tight text-[#1E1F48] sm:text-6xl lg:text-7xl">
                Overené firmy, ktoré sa dostanú k správnym dopytom v správnom čase.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#1E1F48]/72">
                Proworkio spája zákazníkov s overenými firmami podľa lokality, kategórie a reálnej
                pripravenosti projektu. Bez chaosu, bez anonymných kontaktov, s jasnou auditnou
                stopou.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/zadat-dopyt">Zadať nový dopyt</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/firma">Som firma a chcem zákazky</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              {snapshot.stats.map((stat, index) => (
                <Card key={stat.label} className={`reveal-fade ${index === 1 ? "soft-pulse" : ""}`}>
                  <p className="text-sm font-semibold text-[#1E1F48]/60">{stat.label}</p>
                  <p className="mt-3 text-4xl font-black text-[#1E1F48]">{stat.value}</p>
                  <p className="mt-2 text-sm text-[#1E1F48]/68">{stat.description}</p>
                </Card>
              ))}
            </div>
          </div>
          <div className="reveal-fade space-y-6 lg:pl-6">
            <Card>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1E1F48]/55">
                Čo Proworkio rieši
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Párovanie dopytu s firmami cez kategórie a dosah",
                  "Kontakty sa odomknú až po jasnom oprávnení a platbe",
                  "Moderácia firiem, recenzií a zlyhaných notifikácií",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#1E1F48]/10 bg-[#F8F8FF] px-4 py-4 text-sm font-medium text-[#1E1F48]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="bg-[#1E1F48] text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-[#BADD40]">Pre firmy</p>
              <p className="mt-4 text-3xl font-black">
                Získajte dopyty, ktoré dávajú zmysel pre váš obor aj región.
              </p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                VIP profil, galéria realizácií a transparentné lead unlocky bez duplicitných
                platieb.
              </p>
              <Button asChild variant="accent" className="mt-6">
                <Link href="/dashboard/firma/prilezitosti">Pozrieť príležitosti</Link>
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      <section id="ako-to-funguje" className="py-24">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Ako to funguje"
            title="Tri presné kroky od zadania dopytu po relevantnú odpoveď."
            description="Produkt stavia na jasných stavoch, potvrdení dopytu, moderácii profilov a auditovateľnom párovaní."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Zákazník odošle dopyt",
                body: "Viackrokový formulár zachytí kategóriu, detaily, lokalitu, urgentnosť a prílohy. Dopyt zostane nevejnený, kým ho zákazník nepotvrdí.",
              },
              {
                step: "02",
                title: "Systém spáruje firmy",
                body: "PostGIS a deterministické pravidlá vyhodnotia zhodu kategórie, subkategórie a servisného rádiusu. Výsledok je auditovateľný.",
              },
              {
                step: "03",
                title: "Firma odomkne kontakt",
                body: "Kontaktné údaje sú skryté, kým neprebehne úspešná webhookom potvrdená platba alebo pridelené oprávnenie.",
              },
            ].map((item) => (
              <Card key={item.step}>
                <p className="text-sm font-semibold tracking-[0.2em] text-[#2E5ACF]">{item.step}</p>
                <h3 className="mt-6 text-2xl font-black text-[#1E1F48]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#1E1F48]/72">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#1E1F48] py-24 text-white">
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="accent">Kategórie a lokality</Badge>
            <h2 className="max-w-2xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
              Vyberte si odbor, v ktorom chcete získavať nové zákazky.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-white/72">
              Proworkio drží verejný katalóg čitateľný a čistý. Detaily zostávajú oddelené od
              citlivých údajov, no firmy stále vidia, či sa dopyt hodí do ich servisného okruhu.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Maliarske práce", "Strechy", "Elektroinštalácie"].map((category) => (
              <Link
                key={category}
                href={`/kategorie/${category.toLowerCase().replaceAll(" ", "-")}`}
                className="rounded-[1.35rem] border border-white/10 bg-white/8 px-5 py-5 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
              >
                {category}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Najnovšie dopyty"
            title="Reálne zadania pripravené na rýchlu reakciu."
            description="Na verejných detailoch ostávajú citlivé kontakty skryté. Firmy ich uvidia až po oprávnenom odomknutí."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {snapshot.latestRequests.map((request) => (
              <Card key={request.id} className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <Badge variant="muted">{request.locationLabel}</Badge>
                  <div>
                    <h3 className="text-2xl font-black text-[#1E1F48]">{request.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#1E1F48]/72">{request.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-[#1E1F48]/65">
                    <span>{request.deadlineLabel}</span>
                    <span>•</span>
                    <span>{request.budgetLabel}</span>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dopyty/${request.id}`}>Zobraziť detail dopytu</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="surface-stripes py-24">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Odporúčané firmy"
            title="Prezentácia firmy je produktový prvok, nie len adresár."
            description="VIP profil rozširuje dôveryhodnosť cez bohatšiu galériu, recenzie a lepšie textové vysvetlenie toho, čo firma robí."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {snapshot.featuredCompanies.map((company) => (
              <Card key={company.id} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-72 overflow-hidden rounded-[1.25rem]">
                  {company.heroImageUrl ? (
                    <Image src={company.heroImageUrl} alt={company.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3">
                    {company.vip ? <Badge>VIP profil</Badge> : <Badge variant="muted">Overená firma</Badge>}
                    <Badge variant="dark">{company.rating100} / 100</Badge>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#1E1F48]">{company.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#1E1F48]/72">{company.shortDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-medium text-[#1E1F48]/70">
                    <span>{company.city}</span>
                    <span>•</span>
                    <span>Dosah {company.radiusKm} km</span>
                    <span>•</span>
                    <span>{company.reviewsCount} recenzií</span>
                  </div>
                  <Button asChild variant="primary">
                    <Link href={`/firmy/${company.slug}`}>Pozrieť firemný profil</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="space-y-12">
          <SectionHeading
            eyebrow="Obsah a dôvera"
            title="Obsah, ktorý zvyšuje konverziu aj kvalitu dopytov."
            description="Blog a sprievodné texty pomáhajú zákazníkom formulovať lepšie zadania a firmám vysvetľujú, ako získať lepší profil."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {snapshot.blogPosts.map((post) => (
              <Card key={post.id} className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="relative min-h-72 overflow-hidden rounded-[1.25rem] bg-[#E7DFCB]">
                  {post.coverUrl ? (
                    <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <Badge variant="muted">{post.category}</Badge>
                    <h3 className="text-3xl font-black text-[#1E1F48]">{post.title}</h3>
                    <p className="text-sm leading-7 text-[#1E1F48]/72">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-[#1E1F48]/58">
                      <p>Zverejnené {new Date(post.publishedAt).toLocaleDateString("sk-SK")}</p>
                      <p>{post.readingMinutes} min čítania</p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/blog/${post.slug}`}>Zobraziť článok</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
