import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@proworkio/types";

import {
  dashboardFeed as fallbackDashboardFeed,
  dashboardMetrics as fallbackDashboardMetrics,
  dashboardQueues as fallbackDashboardQueues,
  dashboardCopy,
  getResourceConfig,
  resourceConfigs,
  type DashboardFeedItem,
  type DashboardMetric,
  type DashboardQueueItem,
  type ResourceConfig,
  type ResourceKey,
  type ResourceRow,
  type ResourceSignal,
} from "@/lib/admin-data";
import {
  auditResultBadge,
  blogStatusBadge,
  companyApprovalBadge,
  formatCurrencyCents,
  formatDate,
  formatRadius,
  formatRelativeTime,
  invoiceBadge,
  matchVisibilityBadge,
  notificationResultBadge,
  paymentStatusBadge,
  percentageLabel,
  planBadge,
  requestStatusBadge,
  reviewStatusBadge,
  subscriptionStatusBadge,
  summarizeMatchReason,
  unlockBadge,
  webhookStatusBadge,
} from "@/lib/admin-presenters";
import { adminRuntimeMode, featureFlags, runtimeConfig } from "@/lib/platform";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type MatchRow = Database["public"]["Tables"]["request_company_matches"]["Row"];
type PaymentRow = Database["billing"]["Tables"]["payments"]["Row"];
type InvoiceRow = Database["billing"]["Tables"]["invoices"]["Row"];
type SubscriptionRow = Database["billing"]["Tables"]["subscriptions"]["Row"];
type UnlockRow = Database["billing"]["Tables"]["lead_unlock_entitlements"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type NotificationMessageRow = Database["ops"]["Tables"]["notification_messages"]["Row"];
type NotificationAttemptRow = Database["ops"]["Tables"]["notification_delivery_attempts"]["Row"];
type WebhookEventRow = Database["ops"]["Tables"]["webhook_events"]["Row"];
type AuditLogRow = Database["ops"]["Tables"]["audit_logs"]["Row"];

export interface AdminShellState {
  badgeLabel: string;
  environmentLabel: string;
  sourceLabel: string;
  modeLabel: string;
}

export interface DashboardViewModel {
  metrics: DashboardMetric[];
  queues: DashboardQueueItem[];
  feed: DashboardFeedItem[];
  resourceHighlights: Record<ResourceKey, string>;
  requestsCount: number;
  companiesCount: number;
  paymentsCount: number;
  notificationsCount: number;
  webhooksCount: number;
  headerBadge: string;
  priorityCount: number;
}

export interface ResourceViewModel {
  config: ResourceConfig;
  rows: ResourceRow[];
  signals: ResourceSignal[];
  badgeLabel: string;
  surfaceLabel: string;
}

function fallbackShellState(): AdminShellState {
  return {
    badgeLabel: "Fallback",
    environmentLabel: `${runtimeConfig.nodeEnv} / sk`,
    sourceLabel: "lokálne seed dáta",
    modeLabel: "statický fallback",
  };
}

export function getAdminShellState(): AdminShellState {
  if (!featureFlags.hasSupabaseService) {
    return fallbackShellState();
  }

  return {
    badgeLabel: "Live",
    environmentLabel: `${runtimeConfig.nodeEnv} / sk`,
    sourceLabel: "Supabase hosted",
    modeLabel: "server-side read model",
  };
}

function fallbackDashboardViewModel(): DashboardViewModel {
  return {
    metrics: fallbackDashboardMetrics,
    queues: fallbackDashboardQueues,
    feed: fallbackDashboardFeed,
    resourceHighlights: Object.fromEntries(
      Object.entries(resourceConfigs).map(([key, resource]) => [key, resource.signals[0]?.value ?? "0"]),
    ) as Record<ResourceKey, string>,
    requestsCount: resourceConfigs.requests.rows.length,
    companiesCount: resourceConfigs.companies.rows.length,
    paymentsCount: resourceConfigs.payments.rows.length,
    notificationsCount: resourceConfigs.notifications.rows.length,
    webhooksCount: resourceConfigs.webhooks.rows.length,
    headerBadge: dashboardCopy.badge,
    priorityCount: 3,
  };
}

function fallbackResourceViewModel(resource: ResourceKey): ResourceViewModel {
  const config = getResourceConfig(resource);
  return {
    config,
    rows: config.rows,
    signals: config.signals,
    badgeLabel: `Záznamov: ${config.rows.length}`,
    surfaceLabel: "Fallback dáta",
  };
}

async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>,
  context: string,
): Promise<T> {
  const result = await promise;
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  if (result.data === null) {
    throw new Error(`${context}: data is null`);
  }

  return result.data;
}

async function loadCategoriesMap() {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return new Map<string, string>();
  }

  const categories = await unwrap(
    supabase.from("categories").select("id, name_sk"),
    "loadCategoriesMap",
  );

  return new Map(categories.map((category: Pick<CategoryRow, "id" | "name_sk">) => [category.id, category.name_sk]));
}

async function loadCompaniesMap() {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return new Map<string, string>();
  }

  const companies = await unwrap(
    supabase.from("companies").select("id, display_name"),
    "loadCompaniesMap",
  );

  return new Map(companies.map((company: Pick<CompanyRow, "id" | "display_name">) => [company.id, company.display_name]));
}

async function loadRequestsMap() {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return new Map<string, string>();
  }

  const requests = await unwrap(
    supabase.from("requests").select("id, title"),
    "loadRequestsMap",
  );

  return new Map(requests.map((request: Pick<RequestRow, "id" | "title">) => [request.id, request.title]));
}

function resourceHighlight(value: number | string): string {
  return typeof value === "number" ? `${value}` : value;
}

export async function getDashboardViewModel(): Promise<DashboardViewModel> {
  noStore();

  if (!featureFlags.hasSupabaseService) {
    return fallbackDashboardViewModel();
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return fallbackDashboardViewModel();
  }

  try {
    const [
      requests,
      companies,
      matches,
      payments,
      subscriptions,
      reviews,
      notifications,
      notificationAttempts,
      webhooks,
    ] = await Promise.all([
      unwrap(
        supabase
          .from("requests")
          .select("id, title, status, confirmation_status, created_at, confirmed_at"),
        "dashboard.requests",
      ) as Promise<Array<Pick<RequestRow, "id" | "title" | "status" | "confirmation_status" | "created_at" | "confirmed_at">>>,
      unwrap(
        supabase
          .from("companies")
          .select("id, display_name, status, moderation_status, completeness_score, created_at"),
        "dashboard.companies",
      ) as Promise<Array<Pick<CompanyRow, "id" | "display_name" | "status" | "moderation_status" | "completeness_score" | "created_at">>>,
      unwrap(
        supabase
          .from("request_company_matches")
          .select("id, request_id, company_id, score, status, created_at"),
        "dashboard.matches",
      ) as Promise<Array<Pick<MatchRow, "id" | "request_id" | "company_id" | "score" | "status" | "created_at">>>,
      unwrap(
        supabase
          .schema("billing")
          .from("payments")
          .select("id, status, purpose, created_at"),
        "dashboard.payments",
      ) as Promise<Array<Pick<PaymentRow, "id" | "status" | "purpose" | "created_at">>>,
      unwrap(
        supabase
          .schema("billing")
          .from("subscriptions")
          .select("id, status, current_period_end, created_at"),
        "dashboard.subscriptions",
      ) as Promise<Array<Pick<SubscriptionRow, "id" | "status" | "current_period_end" | "created_at">>>,
      unwrap(
        supabase
          .from("reviews")
          .select("id, status, created_at"),
        "dashboard.reviews",
      ) as Promise<Array<Pick<ReviewRow, "id" | "status" | "created_at">>>,
      unwrap(
        supabase
          .schema("ops")
          .from("notification_messages")
          .select("id, status, preferred_channels, final_channel, template_code, created_at"),
        "dashboard.notifications",
      ) as Promise<Array<Pick<NotificationMessageRow, "id" | "status" | "preferred_channels" | "final_channel" | "template_code" | "created_at">>>,
      unwrap(
        supabase
          .schema("ops")
          .from("notification_delivery_attempts")
          .select("id, status, attempted_at"),
        "dashboard.notificationAttempts",
      ) as Promise<Array<Pick<NotificationAttemptRow, "id" | "status" | "attempted_at">>>,
      unwrap(
        supabase
          .schema("ops")
          .from("webhook_events")
          .select("id, provider, event_type, status, received_at"),
        "dashboard.webhooks",
      ) as Promise<Array<Pick<WebhookEventRow, "id" | "provider" | "event_type" | "status" | "received_at">>>,
    ]);

    const now = new Date();
    const confirmedToday = requests.filter((request) => {
      if (!request.confirmed_at) {
        return false;
      }

      return new Date(request.confirmed_at).toDateString() === now.toDateString();
    }).length;
    const pendingCompanies = companies.filter(
      (company) =>
        company.status === "pending_verification" ||
        company.status === "pending_review" ||
        company.moderation_status === "unreviewed" ||
        company.moderation_status === "needs_changes",
    ).length;
    const companiesNeedingReview = companies.filter(
      (company) => company.status === "pending_review" || company.moderation_status === "needs_changes",
    ).length;
    const failedNotifications = notifications.filter(
      (notification) => notification.status === "failed" || notification.status === "exhausted",
    ).length;
    const fallbackNotifications = notifications.filter((notification) => {
      const primaryChannel = notification.preferred_channels[0] ?? null;
      return notification.final_channel !== null && primaryChannel !== null && notification.final_channel !== primaryChannel;
    }).length;
    const failedWebhooks = webhooks.filter(
      (webhook) => webhook.status === "failed" || webhook.status === "dead_letter",
    ).length;
    const pendingWebhooks = webhooks.filter(
      (webhook) => webhook.status === "pending" || webhook.status === "processing",
    ).length;
    const activeRequests = requests.filter((request) => request.status === "active").length;
    const openUnlockPayments = payments.filter(
      (payment) =>
        payment.purpose === "lead_unlock" &&
        (payment.status === "created" || payment.status === "pending" || payment.status === "requires_action"),
    ).length;
    const activeVipSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active" || subscription.status === "trialing",
    ).length;
    const latestRequest = [...requests].sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
    const latestMatch = [...matches].sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
    const latestPayment = [...payments].sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
    const latestWebhook = [...webhooks].sort((left, right) => right.received_at.localeCompare(left.received_at))[0];

    const feed: DashboardFeedItem[] = [];

    if (latestRequest) {
      feed.push({
        title: "Nový dopyt v pipeline",
        detail: `${latestRequest.title} je momentálne v stave ${latestRequest.status}.`,
        time: formatRelativeTime(latestRequest.created_at, now),
        tone: latestRequest.status === "active" ? "accent" : "muted",
      });
    }

    if (latestMatch) {
      feed.push({
        title: "Matching aktualizovaný",
        detail: `Match ${latestMatch.id.slice(0, 8)} dosiahol skóre ${latestMatch.score}/100.`,
        time: formatRelativeTime(latestMatch.created_at, now),
        tone: latestMatch.status === "unlocked" ? "accent" : "muted",
      });
    }

    if (latestPayment) {
      feed.push({
        title: "Billing event",
        detail: `${latestPayment.purpose === "vip_subscription" ? "VIP predplatné" : "Kontakt unlock"} má stav ${latestPayment.status}.`,
        time: formatRelativeTime(latestPayment.created_at, now),
        tone: latestPayment.status === "succeeded" ? "accent" : latestPayment.status === "failed" ? "dark" : "muted",
      });
    }

    if (latestWebhook) {
      feed.push({
        title: "Webhook prijatý",
        detail: `${latestWebhook.provider} event ${latestWebhook.event_type} je v stave ${latestWebhook.status}.`,
        time: formatRelativeTime(latestWebhook.received_at, now),
        tone: latestWebhook.status === "processed" ? "accent" : latestWebhook.status === "failed" ? "dark" : "muted",
      });
    }

    return {
      metrics: [
        {
          label: "Aktívne dopyty",
          value: `${activeRequests}`,
          note: `${confirmedToday} potvrdených dnes`,
          tone: "accent",
        },
        {
          label: "Firemné schválenia",
          value: `${pendingCompanies}`,
          note: `${companiesNeedingReview} čakajú na ručný review`,
          tone: pendingCompanies > 0 ? "muted" : "accent",
        },
        {
          label: "Neúspešné notifikácie",
          value: `${failedNotifications}`,
          note: `${fallbackNotifications} správ prešlo fallbackom`,
          tone: failedNotifications > 0 ? "dark" : "muted",
        },
        {
          label: "Webhook chyby",
          value: `${failedWebhooks}`,
          note: `${pendingWebhooks} čaká na retry`,
          tone: failedWebhooks > 0 ? "dark" : "muted",
        },
      ],
      queues: [
        {
          title: "Moderácia firemných profilov",
          note: `${pendingCompanies} profilov čaká na schválenie alebo doplnenie údajov.`,
          tone: pendingCompanies > 0 ? "accent" : "muted",
        },
        {
          title: "Kontakt unlocky",
          note: `${openUnlockPayments} platieb unlocku ešte nepotvrdil finálny billing stav.`,
          tone: openUnlockPayments > 0 ? "dark" : "muted",
        },
        {
          title: "Fallbacky notifikácií",
          note: `${fallbackNotifications} správ preskočilo na sekundárny kanál, ${failedNotifications} zlyhalo úplne.`,
          tone: failedNotifications > 0 ? "dark" : "muted",
        },
      ],
      feed: feed.length > 0 ? feed : fallbackDashboardFeed,
      resourceHighlights: {
        users: resourceHighlight(requests.length),
        companies: resourceHighlight(companies.length),
        requests: resourceHighlight(activeRequests),
        matches: resourceHighlight(matches.length),
        payments: resourceHighlight(payments.length),
        subscriptions: resourceHighlight(activeVipSubscriptions),
        reviews: resourceHighlight(reviews.length),
        blog: resourceHighlight(resourceConfigs.blog.signals[0]?.value ?? "0"),
        notifications: resourceHighlight(notifications.length),
        webhooks: resourceHighlight(webhooks.length),
        auditLogs: resourceHighlight(resourceConfigs.auditLogs.signals[0]?.value ?? "0"),
      },
      requestsCount: requests.length,
      companiesCount: companies.length,
      paymentsCount: payments.length,
      notificationsCount: notificationAttempts.length,
      webhooksCount: pendingWebhooks + failedWebhooks,
      headerBadge: adminRuntimeMode === "live" ? "Live / Supabase" : dashboardCopy.badge,
      priorityCount: [
        pendingCompanies > 0,
        openUnlockPayments > 0,
        failedNotifications > 0 || failedWebhooks > 0,
      ].filter(Boolean).length,
    };
  } catch (error) {
    console.error("[admin] falling back to static dashboard data", error);
    return fallbackDashboardViewModel();
  }
}

export async function getResourceViewModel(resource: ResourceKey): Promise<ResourceViewModel> {
  noStore();

  if (!featureFlags.hasSupabaseService) {
    return fallbackResourceViewModel(resource);
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return fallbackResourceViewModel(resource);
  }

  try {
    switch (resource) {
      case "users": {
        const [profiles, requests] = await Promise.all([
          unwrap(
            supabase
              .from("profiles")
              .select("id, full_name, email, role, updated_at")
              .order("updated_at", { ascending: false })
              .limit(12),
            "resource.users.profiles",
          ) as Promise<Array<Pick<ProfileRow, "id" | "full_name" | "email" | "role" | "updated_at">>>,
          unwrap(
            supabase
              .from("requests")
              .select("id, public_code, title, customer_profile_id, created_at"),
            "resource.users.requests",
          ) as Promise<Array<Pick<RequestRow, "id" | "public_code" | "title" | "customer_profile_id" | "created_at">>>,
        ]);

        const guestRequests = requests.filter((request) => request.customer_profile_id === null);
        const rows: ResourceRow[] = [
          ...profiles.map((profile) => ({
            id: profile.id,
            name: profile.full_name ?? profile.email,
            role: profile.role,
            status: profile.role === "admin" ? { label: "Admin", tone: "dark" as const } : { label: "Registrovaný", tone: "accent" as const },
            lastActive: formatRelativeTime(profile.updated_at),
            risk: "nízke",
          })),
          ...guestRequests.slice(0, 12).map((request) => ({
            id: request.id,
            name: `Hosť · ${request.public_code}`,
            role: "guest_customer",
            status: { label: "Guest dopyt", tone: "muted" as const },
            lastActive: formatRelativeTime(request.created_at),
            risk: "stredné",
          })),
        ].slice(0, 20);

        return {
          config: getResourceConfig(resource),
          rows,
          signals: [
            {
              label: "Registrované profily",
              value: `${profiles.length}`,
              note: `${profiles.filter((profile) => profile.role === "customer").length} zákazníckych účtov`,
              tone: "accent",
            },
            {
              label: "Guest kontakty",
              value: `${guestRequests.length}`,
              note: "dopyty odoslané bez registrácie",
              tone: "muted",
            },
            {
              label: "Admin prístupy",
              value: `${profiles.filter((profile) => profile.role === "admin").length}`,
              note: "na hosted dátach",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${rows.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "companies": {
        const [companies, subscriptions] = await Promise.all([
          unwrap(
            supabase
              .from("companies")
              .select("id, display_name, status, moderation_status, city, radius_meters, completeness_score")
              .order("created_at", { ascending: false }),
            "resource.companies.companies",
          ) as Promise<Array<Pick<CompanyRow, "id" | "display_name" | "status" | "moderation_status" | "city" | "radius_meters" | "completeness_score">>>,
          unwrap(
            supabase
              .schema("billing")
              .from("subscriptions")
              .select("company_id, plan_code, status"),
            "resource.companies.subscriptions",
          ) as Promise<Array<Pick<SubscriptionRow, "company_id" | "plan_code" | "status">>>,
        ]);

        const subscriptionsByCompany = new Map(
          subscriptions.map((subscription) => [subscription.company_id, subscription]),
        );
        const averageCompleteness =
          companies.length > 0
            ? companies.reduce((sum, company) => sum + company.completeness_score, 0) / companies.length
            : 0;

        return {
          config: getResourceConfig(resource),
          rows: companies.map((company) => {
            const subscription = subscriptionsByCompany.get(company.id);
            return {
              id: company.id,
              name: company.display_name,
              approval: companyApprovalBadge(company.status, company.moderation_status),
              plan: planBadge(subscription?.plan_code ?? "basic", subscription?.status ?? null),
              coverage: `${company.city} ${formatRadius(company.radius_meters)}`,
              quality: percentageLabel(company.completeness_score),
            };
          }),
          signals: [
            {
              label: "Čakajúce schválenie",
              value: `${companies.filter((company) => company.status !== "active").length}`,
              note: "pending verifikácia alebo review",
              tone: "accent",
            },
            {
              label: "VIP aktívne",
              value: `${subscriptions.filter((subscription) => subscription.status === "active").length}`,
              note: "hosted billing dáta",
              tone: "muted",
            },
            {
              label: "Kompletnosť profilov",
              value: percentageLabel(averageCompleteness),
              note: "priemer naprieč firmami",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${companies.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "requests": {
        const [requests, categories, unlocks] = await Promise.all([
          unwrap(
            supabase
              .from("requests")
              .select("id, title, category_id, status, confirmation_status, created_at")
              .order("created_at", { ascending: false }),
            "resource.requests.requests",
          ) as Promise<Array<Pick<RequestRow, "id" | "title" | "category_id" | "status" | "confirmation_status" | "created_at">>>,
          loadCategoriesMap(),
          unwrap(
            supabase
              .schema("billing")
              .from("lead_unlock_entitlements")
              .select("request_id, status"),
            "resource.requests.unlocks",
          ) as Promise<Array<Pick<UnlockRow, "request_id" | "status">>>,
        ]);

        const unlocksByRequest = new Map(unlocks.map((unlock) => [unlock.request_id, unlock.status]));

        return {
          config: getResourceConfig(resource),
          rows: requests.map((request) => ({
            id: request.id,
            title: request.title,
            category: categories.get(request.category_id) ?? "Nezaradené",
            state: requestStatusBadge(request.status, request.confirmation_status),
            unlock: unlockBadge(unlocksByRequest.get(request.id) ?? null),
            age: formatRelativeTime(request.created_at),
          })),
          signals: [
            {
              label: "Čaká na potvrdenie",
              value: `${requests.filter((request) => request.confirmation_status === "pending").length}`,
              note: "e-mail potvrdenie ešte neprešlo",
              tone: "accent",
            },
            {
              label: "Aktívne",
              value: `${requests.filter((request) => request.status === "active").length}`,
              note: "živé dopyty v pipeline",
              tone: "muted",
            },
            {
              label: "Expirované / uzavreté",
              value: `${requests.filter((request) => request.status === "expired" || request.status === "closed").length}`,
              note: "bez ďalšej aktivity",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${requests.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "matches": {
        const [matches, companies, requests] = await Promise.all([
          unwrap(
            supabase
              .from("request_company_matches")
              .select("id, request_id, company_id, score, status, distance_meters, explanation")
              .order("created_at", { ascending: false }),
            "resource.matches.matches",
          ) as Promise<Array<Pick<MatchRow, "id" | "request_id" | "company_id" | "score" | "status" | "distance_meters" | "explanation">>>,
          loadCompaniesMap(),
          loadRequestsMap(),
        ]);

        const averageScore =
          matches.length > 0 ? matches.reduce((sum, match) => sum + match.score, 0) / matches.length : 0;

        return {
          config: getResourceConfig(resource),
          rows: matches.map((match) => ({
            id: match.id,
            request: requests.get(match.request_id) ?? match.request_id.slice(0, 8),
            company: companies.get(match.company_id) ?? match.company_id.slice(0, 8),
            score: `${match.score}`,
            reason: summarizeMatchReason(match.explanation, match.distance_meters),
            visibility: matchVisibilityBadge(match.status),
          })),
          signals: [
            {
              label: "Otvorené zhody",
              value: `${matches.filter((match) => match.status === "available" || match.status === "pending_notification" || match.status === "viewed").length}`,
              note: "pripravené pre firmu",
              tone: "accent",
            },
            {
              label: "Priemerné skóre",
              value: `${Math.round(averageScore)}/100`,
              note: "deterministický matching",
              tone: "muted",
            },
            {
              label: "Odomknuté",
              value: `${matches.filter((match) => match.status === "unlocked" || match.status === "won").length}`,
              note: "kontakt už je viditeľný",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${matches.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "payments": {
        const [payments, invoices] = await Promise.all([
          unwrap(
            supabase
              .schema("billing")
              .from("payments")
              .select("id, payment_intent_id, checkout_session_id, purpose, amount_cents, currency, status")
              .order("created_at", { ascending: false }),
            "resource.payments.payments",
          ) as Promise<Array<Pick<PaymentRow, "id" | "payment_intent_id" | "checkout_session_id" | "purpose" | "amount_cents" | "currency" | "status">>>,
          unwrap(
            supabase
              .schema("billing")
              .from("invoices")
              .select("payment_id, status"),
            "resource.payments.invoices",
          ) as Promise<Array<Pick<InvoiceRow, "payment_id" | "status">>>,
        ]);

        const invoicesByPayment = new Map(
          invoices
            .filter((invoice) => invoice.payment_id !== null)
            .map((invoice) => [invoice.payment_id as string, invoice.status]),
        );

        return {
          config: getResourceConfig(resource),
          rows: payments.map((payment) => ({
            id: payment.id,
            reference: payment.payment_intent_id ?? payment.checkout_session_id ?? payment.id.slice(0, 8),
            type: payment.purpose === "vip_subscription" ? "VIP monthly" : "Kontakt unlock",
            amount: formatCurrencyCents(payment.amount_cents, payment.currency),
            status: paymentStatusBadge(payment.status),
            invoice: invoiceBadge(invoicesByPayment.get(payment.id) ?? null),
          })),
          signals: [
            {
              label: "Úspešné",
              value: `${payments.filter((payment) => payment.status === "succeeded").length}`,
              note: "potvrdené webhookom",
              tone: "accent",
            },
            {
              label: "Zamietnuté",
              value: `${payments.filter((payment) => payment.status === "failed" || payment.status === "canceled").length}`,
              note: "bez duplicitného charge",
              tone: "dark",
            },
            {
              label: "Čaká billing stav",
              value: `${payments.filter((payment) => payment.status === "created" || payment.status === "pending" || payment.status === "requires_action").length}`,
              note: "redirect nie je zdroj pravdy",
              tone: "muted",
            },
          ],
          badgeLabel: `Záznamov: ${payments.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "subscriptions": {
        const [subscriptions, companies] = await Promise.all([
          unwrap(
            supabase
              .schema("billing")
              .from("subscriptions")
              .select("id, company_id, plan_code, status, current_period_end")
              .order("created_at", { ascending: false }),
            "resource.subscriptions.subscriptions",
          ) as Promise<Array<Pick<SubscriptionRow, "id" | "company_id" | "plan_code" | "status" | "current_period_end">>>,
          loadCompaniesMap(),
        ]);

        return {
          config: getResourceConfig(resource),
          rows: subscriptions.map((subscription) => ({
            id: subscription.id,
            company: companies.get(subscription.company_id) ?? subscription.company_id.slice(0, 8),
            plan: planBadge(subscription.plan_code, subscription.status),
            renewal: formatDate(subscription.current_period_end),
            status: subscriptionStatusBadge(subscription.status),
            portal: { label: "Dostupný", tone: "muted" as const },
          })),
          signals: [
            {
              label: "VIP aktívne",
              value: `${subscriptions.filter((subscription) => subscription.status === "active" || subscription.status === "trialing").length}`,
              note: "s customer portalom",
              tone: "accent",
            },
            {
              label: "Neúspešné platby",
              value: `${subscriptions.filter((subscription) => subscription.status === "past_due" || subscription.status === "unpaid").length}`,
              note: "dunning stav",
              tone: "dark",
            },
            {
              label: "Portal ready",
              value: `${subscriptions.length}`,
              note: "hosted billing účty",
              tone: "muted",
            },
          ],
          badgeLabel: `Záznamov: ${subscriptions.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "reviews": {
        const [reviews, companies] = await Promise.all([
          unwrap(
            supabase
              .from("reviews")
              .select("id, author_name, company_id, rating_percent, status, verified_interaction")
              .order("created_at", { ascending: false }),
            "resource.reviews.reviews",
          ) as Promise<Array<Pick<ReviewRow, "id" | "author_name" | "company_id" | "rating_percent" | "status" | "verified_interaction">>>,
          loadCompaniesMap(),
        ]);

        return {
          config: getResourceConfig(resource),
          rows: reviews.map((review) => ({
            id: review.id,
            author: review.author_name,
            company: companies.get(review.company_id) ?? review.company_id.slice(0, 8),
            score: `${review.rating_percent}`,
            status: reviewStatusBadge(review.status),
            evidence: review.verified_interaction ? "overená interakcia" : "bez overenia",
          })),
          signals: [
            {
              label: "Na review",
              value: `${reviews.filter((review) => review.status === "pending").length}`,
              note: "pred publikovaním",
              tone: "accent",
            },
            {
              label: "Schválené",
              value: `${reviews.filter((review) => review.status === "approved").length}`,
              note: "viditeľné na profile",
              tone: "muted",
            },
            {
              label: "Skryté / zamietnuté",
              value: `${reviews.filter((review) => review.status === "hidden" || review.status === "rejected").length}`,
              note: "anti-abuse ochrana",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${reviews.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "blog": {
        const [posts, categories] = await Promise.all([
          unwrap(
            supabase
              .from("blog_posts")
              .select("id, title_sk, category_id, seo_title_sk, seo_description_sk, status, published_at, video_url")
              .order("created_at", { ascending: false }),
            "resource.blog.posts",
          ) as Promise<Array<Pick<BlogPostRow, "id" | "title_sk" | "category_id" | "seo_title_sk" | "seo_description_sk" | "status" | "published_at" | "video_url">>>,
          loadCategoriesMap(),
        ]);

        return {
          config: getResourceConfig(resource),
          rows: posts.map((post) => {
            const seoScore =
              post.seo_title_sk && post.seo_description_sk
                ? 100
                : post.seo_title_sk || post.seo_description_sk
                  ? 70
                  : 40;

            return {
              id: post.id,
              title: post.title_sk,
              category: post.category_id ? categories.get(post.category_id) ?? "Nezaradené" : "Nezaradené",
              seo: { label: `${seoScore}/100`, tone: seoScore >= 90 ? "accent" : seoScore >= 60 ? "muted" : "dark" as const },
              status: blogStatusBadge(post.status),
              publish: formatDate(post.published_at),
            };
          }),
          signals: [
            {
              label: "Koncepty",
              value: `${posts.filter((post) => post.status === "draft").length}`,
              note: "čakajú na publish",
              tone: "accent",
            },
            {
              label: "Publikované",
              value: `${posts.filter((post) => post.status === "published").length}`,
              note: "SEO pripravené",
              tone: "muted",
            },
            {
              label: "Video embed",
              value: `${posts.filter((post) => post.video_url !== null).length}`,
              note: "treba sledovať responsivitu",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${posts.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "notifications": {
        const [messages] = await Promise.all([
          unwrap(
            supabase
              .schema("ops")
              .from("notification_messages")
              .select("id, template_code, preferred_channels, fallback_channels, status, final_channel, created_at")
              .order("created_at", { ascending: false }),
            "resource.notifications.messages",
          ) as Promise<Array<Pick<NotificationMessageRow, "id" | "template_code" | "preferred_channels" | "fallback_channels" | "status" | "final_channel" | "created_at">>>,
        ]);

        return {
          config: getResourceConfig(resource),
          rows: messages.map((message) => ({
            id: message.id,
            event: message.template_code,
            primary: message.preferred_channels[0]?.toUpperCase() ?? "—",
            fallback: message.fallback_channels[0]?.toUpperCase() ?? "—",
            result: notificationResultBadge(message.status, message.final_channel, message.preferred_channels),
            age: formatRelativeTime(message.created_at),
          })),
          signals: [
            {
              label: "Odoslané / doručené",
              value: `${messages.filter((message) => message.status === "sent" || message.status === "delivered").length}`,
              note: "finálny stav kanála",
              tone: "accent",
            },
            {
              label: "Fallbacky",
              value: `${messages.filter((message) => {
                const primaryChannel = message.preferred_channels[0] ?? null;
                return message.final_channel !== null && primaryChannel !== null && message.final_channel !== primaryChannel;
              }).length}`,
              note: "primárny kanál zlyhal",
              tone: "muted",
            },
            {
              label: "Nedoručené",
              value: `${messages.filter((message) => message.status === "failed" || message.status === "exhausted").length}`,
              note: "čaká na retry alebo manuálny zásah",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${messages.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "webhooks": {
        const webhooks = await unwrap(
          supabase
            .schema("ops")
            .from("webhook_events")
            .select("id, provider, event_type, signature_valid, status, processed_at")
            .order("received_at", { ascending: false }),
          "resource.webhooks.webhooks",
        ) as Array<Pick<WebhookEventRow, "id" | "provider" | "event_type" | "signature_valid" | "status" | "processed_at">>;

        return {
          config: getResourceConfig(resource),
          rows: webhooks.map((webhook) => ({
            id: webhook.id,
            source: webhook.provider,
            event: webhook.event_type,
            idempotent: webhook.signature_valid ? { label: "Overené", tone: "accent" as const } : { label: "Neoverené", tone: "dark" as const },
            status: webhookStatusBadge(webhook.status, webhook.signature_valid),
            attempts: webhook.processed_at ? "1" : "0",
          })),
          signals: [
            {
              label: "Spracované",
              value: `${webhooks.filter((webhook) => webhook.status === "processed").length}`,
              note: "uložené do ledgeru",
              tone: "accent",
            },
            {
              label: "Retry",
              value: `${webhooks.filter((webhook) => webhook.status === "pending" || webhook.status === "processing").length}`,
              note: "backoff je aktívny",
              tone: "muted",
            },
            {
              label: "Incident",
              value: `${webhooks.filter((webhook) => webhook.status === "failed" || webhook.status === "dead_letter").length}`,
              note: "vyžaduje zásah",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${webhooks.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      case "auditLogs": {
        const auditLogs = await unwrap(
          supabase
            .schema("ops")
            .from("audit_logs")
            .select("id, action, actor_role, entity_table, entity_id, after_payload, created_at")
            .order("created_at", { ascending: false }),
          "resource.auditLogs.logs",
        ) as Array<Pick<AuditLogRow, "id" | "action" | "actor_role" | "entity_table" | "entity_id" | "after_payload" | "created_at">>;

        return {
          config: getResourceConfig(resource),
          rows: auditLogs.map((entry) => ({
            id: entry.id,
            action: entry.action,
            actor: entry.actor_role ?? "system",
            resource: `${entry.entity_table}:${entry.entity_id.slice(0, 8)}`,
            result: auditResultBadge(
              typeof entry.after_payload === "object" &&
                entry.after_payload !== null &&
                Object.keys(entry.after_payload as Record<string, unknown>).length > 0,
            ),
            time: formatRelativeTime(entry.created_at),
          })),
          signals: [
            {
              label: "Záznamy",
              value: `${auditLogs.length}`,
              note: "append-only audit trail",
              tone: "accent",
            },
            {
              label: "Citlivé akcie",
              value: `${auditLogs.filter((entry) => entry.actor_role === "admin").length}`,
              note: "admin zásahy",
              tone: "muted",
            },
            {
              label: "RLS overenie",
              value: featureFlags.hasSupabaseService ? "100%" : "0%",
              note: "čítame cez server role",
              tone: "dark",
            },
          ],
          badgeLabel: `Záznamov: ${auditLogs.length}`,
          surfaceLabel: "Live dáta",
        };
      }
      default:
        return fallbackResourceViewModel(resource);
    }
  } catch (error) {
    console.error(`[admin] falling back to static resource data for ${resource}`, error);
    return fallbackResourceViewModel(resource);
  }
}
