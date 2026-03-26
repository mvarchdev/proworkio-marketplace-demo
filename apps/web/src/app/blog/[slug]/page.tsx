import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Článok nenájdený",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = (await getAllBlogPosts()).filter((entry) => entry.slug !== post.slug).slice(0, 2);

  return (
    <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_22rem]">
      <article className="space-y-8">
        <Badge>{post.category}</Badge>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-balance text-5xl font-black tracking-tight text-[#1E1F48]">
            {post.title}
          </h1>
          <p className="text-lg leading-8 text-[#1E1F48]/70">{post.excerpt}</p>
        </div>
        <div className="relative min-h-96 overflow-hidden rounded-[1.75rem]">
          {post.coverUrl ? (
            <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="prose prose-slate max-w-none prose-p:text-[#1E1F48]/72 prose-p:leading-8 prose-headings:font-black prose-headings:text-[#1E1F48]">
          <p>
            Tento obsah je spravovaný priamo v Proworkio admin rozhraní. Redakčný tím vie pri každom
            článku upraviť SEO názov, popis, perex, cover obrázok a interné prepojenia na kategórie.
          </p>
          <p>
            Z pohľadu produktu to znamená, že marketingové a transakčné časti fungujú nad rovnakým
            taxonomickým modelom. Články tak prirodzene dopĺňajú dopytové kategórie a posilňujú SEO
            bez toho, aby vznikal paralelný CMS ostrov.
          </p>
          <p>
            Pre ďalší rozvoj je pripravené aj video embed pole a prepojenie na súvisiace články podľa
            kategórie. Na produkcii by tieto bloky čerpali dáta priamo z databázy a verejných view.
          </p>
        </div>
      </article>
      <aside className="space-y-4">
        <Card className="bg-[#1E1F48] text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-[#BADD40]">Publikačné meta</p>
          <p className="mt-4 text-sm text-white/70">
            {new Date(post.publishedAt).toLocaleDateString("sk-SK")} • {post.readingMinutes} min
          </p>
        </Card>
        {related.map((entry) => (
          <Card key={entry.id}>
            <Badge variant="muted">{entry.category}</Badge>
            <h2 className="mt-4 text-2xl font-black text-[#1E1F48]">{entry.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#1E1F48]/70">{entry.excerpt}</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href={`/blog/${entry.slug}`}>Súvisiaci článok</Link>
            </Button>
          </Card>
        ))}
      </aside>
    </Container>
  );
}
