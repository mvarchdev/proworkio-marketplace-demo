import type { MetadataRoute } from "next";

import { getAllBlogPosts, getAllCompanies, getAllRequests, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, companies, requests] = await Promise.all([
    getAllBlogPosts(),
    getAllCompanies(),
    getAllRequests(),
  ]);

  const staticRoutes = [
    "",
    "/blog",
    "/faq",
    "/obchodne-podmienky",
    "/ochrana-sukromia",
    "/cookies",
    "/zadat-dopyt",
  ];

  return [
    ...staticRoutes.map((route, index) => ({
      url: `${siteConfig.baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: index === 0 ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: post.coverUrl ? [`${siteConfig.baseUrl}${post.coverUrl}`] : undefined,
    })),
    ...companies.map((company) => ({
      url: `${siteConfig.baseUrl}/firmy/${company.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
      images: company.heroImageUrl ? [`${siteConfig.baseUrl}${company.heroImageUrl}`] : undefined,
    })),
    ...requests.map((request) => ({
      url: `${siteConfig.baseUrl}/dopyty/${request.id}`,
      lastModified: new Date(request.publishedAt ?? request.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.65,
    })),
  ];
}
