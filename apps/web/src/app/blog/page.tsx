import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge, Button, Card, Container } from "@proworkio/ui";

import { SectionHeading } from "@/components/section-heading";
import { getAllBlogPosts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Praktické články pre zákazníkov aj firmy v oblasti stavebných a domácich služieb.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <Container className="space-y-12 py-16">
      <SectionHeading
        eyebrow="Blog a CMS"
        title="Obsah, ktorý zvyšuje dôveru, kvalitu dopytov a SEO výkon."
        description="Redakčný obsah ostáva v rovnakom produkte ako zvyšok marketplace. Admin tím vie spravovať kategórie, SEO aj publikáciu bez externého CMS."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id} className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative min-h-72 overflow-hidden rounded-[1.25rem] bg-[#E7DFCB]">
              {post.coverUrl ? (
                <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <Badge variant="muted">{post.category}</Badge>
                <h2 className="text-3xl font-black text-[#1E1F48]">{post.title}</h2>
                <p className="text-sm leading-7 text-[#1E1F48]/72">{post.excerpt}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#1E1F48]/58">
                  <p>{new Date(post.publishedAt).toLocaleDateString("sk-SK")}</p>
                  <p>{post.readingMinutes} min čítania</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/blog/${post.slug}`}>Čítať článok</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
