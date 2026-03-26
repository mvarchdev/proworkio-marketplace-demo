import { cache } from "react";

import {
  blogPosts,
  categories,
  featuredCompanies,
  homepageSnapshot,
  latestRequests,
  reviews,
} from "@proworkio/lib";
import type {
  BlogPostPreview,
  Category,
  CategoryFieldDefinition,
  CompanyPublicProfile,
  RequestRecord,
  ReviewRecord,
} from "@proworkio/types";

import { featureFlags, runtimeConfig } from "@/lib/platform";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

export const siteConfig = {
  name: "Proworkio",
  description:
    "Marketplace pre overené firmy, dopyty zákazníkov a rýchle párovanie podľa lokality a odboru.",
  baseUrl: runtimeConfig.appUrl,
  locale: "sk-SK",
};

function resolveStorageAssetUrl(bucket: string, path?: string | null) {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  if (!featureFlags.hasSupabasePublic) {
    return `/${path.replace(/^\/+/, "")}`;
  }

  return `${runtimeConfig.supabaseUrl}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, "")}`;
}

function emptyContact() {
  return {
    name: "Skrytý kontakt",
    email: "hidden@proworkio.invalid",
    phone: "",
    preferredChannel: "email" as const,
  };
}

function mapFieldDefinition(row: Record<string, unknown>): CategoryFieldDefinition {
  const validationRules =
    row.validation_rules && typeof row.validation_rules === "object"
      ? (row.validation_rules as Record<string, unknown>)
      : null;

  return {
    id: String(row.id),
    fieldKey: String(row.field_key),
    label: String(row.label_sk),
    type: row.field_type as CategoryFieldDefinition["type"],
    required: Boolean(row.is_required),
    ...(row.help_text_sk ? { helpText: String(row.help_text_sk) } : {}),
    ...(Array.isArray(row.options)
      ? { options: row.options as NonNullable<CategoryFieldDefinition["options"]> }
      : {}),
    ...(row.placeholder_sk ? { placeholder: String(row.placeholder_sk) } : {}),
    ...(validationRules?.min !== undefined && !Number.isNaN(Number(validationRules.min))
      ? { min: Number(validationRules.min) }
      : {}),
    ...(validationRules?.max !== undefined && !Number.isNaN(Number(validationRules.max))
      ? { max: Number(validationRules.max) }
      : {}),
  };
}

const getSupabaseCatalog = cache(async (): Promise<Category[] | null> => {
  const supabase = getServiceSupabaseClient();
  if (!featureFlags.hasSupabaseService || !supabase) {
    return null;
  }

  const [{ data: categoryRows, error: categoryError }, { data: fieldSetRows, error: fieldSetError }, { data: fieldRows, error: fieldError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, parent_id, slug, name_sk, description_sk, icon, depth")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("category_field_sets")
        .select("id, category_id, scope, is_active")
        .eq("is_active", true)
        .order("version", { ascending: false }),
      supabase
        .from("category_field_definitions")
        .select("id, field_set_id, field_key, label_sk, help_text_sk, field_type, is_required, options, placeholder_sk, validation_rules")
        .order("sort_order", { ascending: true }),
    ]);

  if (categoryError || fieldSetError || fieldError || !categoryRows) {
    return null;
  }

  const fieldSetsByCategory = new Map<string, { request: string[]; company: string[] }>();
  for (const row of fieldSetRows ?? []) {
    const entry = fieldSetsByCategory.get(String(row.category_id)) ?? { request: [], company: [] };
    if (row.scope === "request") {
      entry.request.push(String(row.id));
    } else {
      entry.company.push(String(row.id));
    }
    fieldSetsByCategory.set(String(row.category_id), entry);
  }

  const fieldsBySet = new Map<string, CategoryFieldDefinition[]>();
  for (const row of fieldRows ?? []) {
    const current = fieldsBySet.get(String(row.field_set_id)) ?? [];
    current.push(mapFieldDefinition(row as Record<string, unknown>));
    fieldsBySet.set(String(row.field_set_id), current);
  }

  return categoryRows.map((row) => {
    const fieldSets = fieldSetsByCategory.get(String(row.id)) ?? { request: [], company: [] };
    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name_sk),
      shortDescription: String(row.description_sk),
      depth: Number(row.depth),
      icon: String(row.icon),
      ...(row.parent_id ? { parentId: String(row.parent_id) } : {}),
      requestFields: fieldSets.request.flatMap((fieldSetId) => fieldsBySet.get(fieldSetId) ?? []),
      companyFields: fieldSets.company.flatMap((fieldSetId) => fieldsBySet.get(fieldSetId) ?? []),
    };
  });
});

const getSupabaseCompanies = cache(async (): Promise<CompanyPublicProfile[] | null> => {
  const supabase = getServiceSupabaseClient();
  if (!featureFlags.hasSupabaseService || !supabase) {
    return null;
  }

  const { data: companiesData, error } = await supabase
    .from("company_public_profiles_v1")
    .select("*")
    .limit(6);

  if (error || !companiesData?.length) {
    return null;
  }

  const companyIds = companiesData.map((row) => String(row.id));
  const { data: categoryRows } = await supabase
    .from("company_categories")
    .select("company_id, categories(name_sk)")
    .in("company_id", companyIds);

  const categoriesByCompany = new Map<string, string[]>();
  for (const row of categoryRows ?? []) {
    const list = categoriesByCompany.get(String(row.company_id)) ?? [];
    const categoryName = (row.categories as { name_sk?: string } | null)?.name_sk;
    if (categoryName) {
      list.push(categoryName);
    }
    categoriesByCompany.set(String(row.company_id), list);
  }

  return companiesData.map((row) => {
    const logoUrl = resolveStorageAssetUrl(String(row.logo_bucket ?? "company-assets"), row.logo_path);
    const heroImageUrl = resolveStorageAssetUrl("company-assets", row.hero_image_path);

    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.display_name),
      legalName: String(row.legal_name),
      shortDescription: String(row.short_description_sk),
      longDescription: String(row.long_description_sk),
      city: String(row.city),
      radiusKm: Math.round(Number(row.radius_meters) / 1000),
      categories: categoriesByCompany.get(String(row.id)) ?? [],
      gallery: [],
      rating100: Number(row.rating_percent ?? 0),
      reviewsCount: Number(row.reviews_count ?? 0),
      vip: Boolean(row.is_vip),
      status: "active",
      moderationStatus: "approved",
      ...(logoUrl ? { logoUrl } : {}),
      ...(heroImageUrl ? { heroImageUrl } : {}),
    };
  });
});

const getSupabaseRequests = cache(async (): Promise<RequestRecord[] | null> => {
  const supabase = getServiceSupabaseClient();
  if (!featureFlags.hasSupabaseService || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("request_public_listings_v1")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data) {
    return null;
  }

  return data.map((row) => ({
    id: String(row.id),
    categoryId: String(row.category_id),
    title: String(row.title),
    description: String(row.description),
    urgency: row.urgency as RequestRecord["urgency"],
    postalCode: "",
    locationLabel: String(row.location_label),
    deadlineLabel:
      row.expires_at
        ? `Aktívne do ${new Date(String(row.expires_at)).toLocaleDateString("sk-SK")}`
        : "Termín podľa dohody",
    dynamicValues: {},
    photos: [],
    contact: emptyContact(),
    termsAccepted: true,
    status: row.status as RequestRecord["status"],
    confirmationStatus: row.confirmation_status as RequestRecord["confirmationStatus"],
    createdAt: String(row.created_at),
    budgetLabel:
      row.budget_max_cents
        ? `${Math.round(Number(row.budget_min_cents ?? 0) / 100)} – ${Math.round(Number(row.budget_max_cents) / 100)} €`
        : "Cena dohodou",
    ...(row.published_at ? { publishedAt: String(row.published_at) } : {}),
  }));
});

const getSupabaseBlogPosts = cache(async (): Promise<BlogPostPreview[] | null> => {
  const supabase = getServiceSupabaseClient();
  if (!featureFlags.hasSupabaseService || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title_sk, excerpt_sk, cover_bucket, cover_path, published_at, categories(name_sk)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return data.map((row) => {
    const coverUrl = resolveStorageAssetUrl(String(row.cover_bucket ?? "blog-assets"), row.cover_path);

    return {
      id: String(row.id),
      slug: String(row.slug),
      category: (row.categories as { name_sk?: string } | null)?.name_sk ?? "Blog",
      title: String(row.title_sk),
      excerpt: String(row.excerpt_sk),
      publishedAt: String(row.published_at ?? new Date().toISOString()),
      readingMinutes: Math.max(3, Math.round(String(row.excerpt_sk).split(" ").length / 45)),
      ...(coverUrl ? { coverUrl } : {}),
    };
  });
});

const getSupabaseReviews = cache(async (companyId: string): Promise<ReviewRecord[] | null> => {
  const supabase = getServiceSupabaseClient();
  if (!featureFlags.hasSupabaseService || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return data.map((row) => ({
    id: String(row.id),
    companyId: String(row.company_id),
    authorName: String(row.author_name),
    rating100: Number(row.rating_percent),
    title: String(row.title_sk),
    body: String(row.body_sk),
    status: row.status as ReviewRecord["status"],
    publishedAt: String(row.published_at ?? row.created_at),
  }));
});

export const getHomepageSnapshot = cache(async () => {
  if (!featureFlags.hasSupabaseService) {
    return homepageSnapshot;
  }

  const [catalog, companiesData, requestsData, postsData] = await Promise.all([
    getSupabaseCatalog(),
    getSupabaseCompanies(),
    getSupabaseRequests(),
    getSupabaseBlogPosts(),
  ]);

  if (!catalog || !companiesData || !requestsData || !postsData) {
    return homepageSnapshot;
  }

  return {
    latestRequests: requestsData,
    featuredCompanies: companiesData,
    blogPosts: postsData,
    stats: [
      {
        label: "aktívnych dopytov",
        value: String(requestsData.length),
        description: "Zverejnené a potvrdené dopyty v katalógu",
      },
      {
        label: "živých profilov firiem",
        value: String(companiesData.length),
        description: "Schválené firemné profily s moderáciou",
      },
      {
        label: "obsahových vstupov",
        value: String(postsData.length),
        description: "Publikované články a SEO obsah",
      },
    ],
  };
});

export const getAllCategories = cache(async () => (await getSupabaseCatalog()) ?? categories);
export const getAllCompanies = cache(async () => (await getSupabaseCompanies()) ?? featuredCompanies);
export const getAllRequests = cache(async () => (await getSupabaseRequests()) ?? latestRequests);
export const getAllBlogPosts = cache(async () => (await getSupabaseBlogPosts()) ?? blogPosts);

export const getCategoryBySlug = cache(async (slug: string) =>
  ((await getAllCategories()) ?? []).find((category) => category.slug === slug),
);

export const getCompanyBySlug = cache(async (slug: string) =>
  ((await getAllCompanies()) ?? []).find((company) => company.slug === slug),
);

export const getRequestById = cache(async (id: string) =>
  ((await getAllRequests()) ?? []).find((request) => request.id === id),
);

export const getBlogPostBySlug = cache(async (slug: string) =>
  ((await getAllBlogPosts()) ?? []).find((post) => post.slug === slug),
);

export const getCompanyReviews = cache(async (companyId: string) =>
  (await getSupabaseReviews(companyId)) ??
  reviews.filter((review) => review.companyId === companyId && review.status === "approved"),
);
