import type { Json, Database } from "@proworkio/types";

import { badge, type BadgeCell, type Tone } from "./admin-data";

const relativeFormatter = new Intl.RelativeTimeFormat("sk-SK", { numeric: "auto" });
const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const numberFormatter = new Intl.NumberFormat("sk-SK");

type CompanyStatus = Database["public"]["Enums"]["company_status"];
type ModerationStatus = Database["public"]["Enums"]["moderation_status"];
type RequestStatus = Database["public"]["Enums"]["request_status"];
type RequestConfirmationStatus = Database["public"]["Enums"]["request_confirmation_status"];
type UnlockStatus = Database["public"]["Enums"]["unlock_status"];
type MatchStatus = Database["public"]["Enums"]["match_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
type ReviewStatus = Database["public"]["Enums"]["review_status"];
type BlogPostStatus = Database["public"]["Enums"]["blog_post_status"];
type NotificationStatus = Database["public"]["Enums"]["notification_status"];
type NotificationChannel = Database["public"]["Enums"]["notification_channel"];
type NotificationAttemptStatus = Database["public"]["Enums"]["notification_attempt_status"];
type OutboxStatus = Database["public"]["Enums"]["outbox_status"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

function roundLabel(value: number): string {
  return numberFormatter.format(Math.round(value));
}

function toneFromBoolean(value: boolean, positiveTone: Tone = "accent"): Tone {
  return value ? positiveTone : "dark";
}

function toReasonSegments(explanation: Json): string[] {
  if (Array.isArray(explanation)) {
    return explanation.filter((item): item is string => typeof item === "string");
  }

  if (!explanation || typeof explanation !== "object") {
    return [];
  }

  const rawReasons = Reflect.get(explanation, "reasons");
  if (Array.isArray(rawReasons)) {
    return rawReasons.filter((item): item is string => typeof item === "string");
  }

  return Object.entries(explanation)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replaceAll("_", " "));
}

export function formatRelativeTime(value: string, now = new Date()): string {
  const target = new Date(value);
  const deltaMs = target.getTime() - now.getTime();
  const deltaMinutes = Math.round(deltaMs / 60_000);
  const absoluteMinutes = Math.abs(deltaMinutes);

  if (absoluteMinutes < 60) {
    return relativeFormatter.format(deltaMinutes, "minute");
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  const absoluteHours = Math.abs(deltaHours);
  if (absoluteHours < 24) {
    return relativeFormatter.format(deltaHours, "hour");
  }

  const deltaDays = Math.round(deltaHours / 24);
  const absoluteDays = Math.abs(deltaDays);
  if (absoluteDays < 30) {
    return relativeFormatter.format(deltaDays, "day");
  }

  const deltaMonths = Math.round(deltaDays / 30);
  if (Math.abs(deltaMonths) < 12) {
    return relativeFormatter.format(deltaMonths, "month");
  }

  const deltaYears = Math.round(deltaDays / 365);
  return relativeFormatter.format(deltaYears, "year");
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(new Date(value));
}

export function formatCurrencyCents(amountCents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function percentageLabel(value: number): string {
  return `${roundLabel(value)}%`;
}

export function formatRadius(radiusMeters: number): string {
  return `${roundLabel(radiusMeters / 1000)} km`;
}

export function formatDistance(distanceMeters: number | null): string {
  if (!distanceMeters) {
    return "bez vzdialenosti";
  }

  if (distanceMeters < 1_000) {
    return `${roundLabel(distanceMeters)} m`;
  }

  return `${(Math.round(distanceMeters / 100) / 10).toLocaleString("sk-SK")} km`;
}

export function companyApprovalBadge(status: CompanyStatus, moderationStatus: ModerationStatus): BadgeCell {
  if (status === "active" && moderationStatus === "approved") {
    return badge("Schválená", "accent");
  }

  if (status === "rejected" || moderationStatus === "rejected") {
    return badge("Zamietnutá", "dark");
  }

  if (status === "suspended" || status === "archived") {
    return badge("Pozastavená", "dark");
  }

  if (status === "pending_review" || moderationStatus === "needs_changes") {
    return badge("Čaká na review", "muted");
  }

  if (status === "pending_verification" || moderationStatus === "unreviewed") {
    return badge("Overujeme", "muted");
  }

  return badge("Draft", "muted");
}

export function planBadge(planCode: string, status?: SubscriptionStatus | null): BadgeCell {
  const normalized = planCode.toLowerCase();
  const label = normalized.includes("vip") ? "VIP" : normalized.includes("pro") ? "Pro" : "Basic";

  if (status === "past_due" || status === "unpaid" || status === "canceled") {
    return badge(label, "dark");
  }

  return badge(label, label === "VIP" ? "accent" : "muted");
}

export function requestStatusBadge(
  status: RequestStatus,
  confirmationStatus: RequestConfirmationStatus,
): BadgeCell {
  if (status === "active" && confirmationStatus === "confirmed") {
    return badge("Aktívny", "accent");
  }

  if (status === "awaiting_confirmation" || confirmationStatus === "pending") {
    return badge("Čaká na potvrdenie", "muted");
  }

  if (status === "expired" || confirmationStatus === "expired") {
    return badge("Expirovaný", "dark");
  }

  if (status === "closed") {
    return badge("Uzatvorený", "dark");
  }

  if (status === "archived") {
    return badge("Archivovaný", "dark");
  }

  return badge("Draft", "muted");
}

export function unlockBadge(status: UnlockStatus | null): BadgeCell {
  if (status === "active") {
    return badge("Odomknutý", "accent");
  }

  if (status === "pending_payment") {
    return badge("Čaká na platbu", "muted");
  }

  if (status === "expired" || status === "revoked" || status === "refunded") {
    return badge("Neaktívny", "dark");
  }

  return badge("Neodomknutý", "muted");
}

export function summarizeMatchReason(explanation: Json, distanceMeters: number | null): string {
  const reasons = toReasonSegments(explanation).slice(0, 2);
  if (reasons.length > 0) {
    return reasons.join(" + ");
  }

  if (distanceMeters !== null) {
    return `vzdialenosť ${formatDistance(distanceMeters)}`;
  }

  return "kategória + lokalita";
}

export function matchVisibilityBadge(status: MatchStatus): BadgeCell {
  if (status === "unlocked" || status === "won") {
    return badge("Zobrazené", "accent");
  }

  if (status === "dismissed" || status === "expired") {
    return badge("Skončené", "dark");
  }

  if (status === "viewed") {
    return badge("Prečítané", "muted");
  }

  return badge("Skryté", "muted");
}

export function paymentStatusBadge(status: PaymentStatus): BadgeCell {
  switch (status) {
    case "succeeded":
      return badge("Potvrdené", "accent");
    case "pending":
    case "created":
    case "requires_action":
      return badge("Čaká", "muted");
    case "refunded":
      return badge("Refund", "dark");
    case "failed":
    case "canceled":
      return badge("Zlyhalo", "dark");
    default:
      return badge(status, "muted");
  }
}

export function invoiceBadge(status: InvoiceStatus | null): BadgeCell {
  if (!status || status === "draft") {
    return badge("Čaká", "muted");
  }

  if (status === "issued" || status === "paid") {
    return badge("Synced", "accent");
  }

  return badge("Chyba", "dark");
}

export function subscriptionStatusBadge(status: SubscriptionStatus): BadgeCell {
  switch (status) {
    case "active":
    case "trialing":
      return badge("Aktívne", "accent");
    case "past_due":
    case "unpaid":
      return badge("Varovanie", "dark");
    case "canceled":
      return badge("Zrušené", "dark");
    default:
      return badge("Čaká", "muted");
  }
}

export function reviewStatusBadge(status: ReviewStatus): BadgeCell {
  switch (status) {
    case "approved":
      return badge("Schválené", "accent");
    case "pending":
      return badge("Na review", "muted");
    case "hidden":
    case "rejected":
      return badge("Skryté", "dark");
    default:
      return badge(status, "muted");
  }
}

export function blogStatusBadge(status: BlogPostStatus): BadgeCell {
  switch (status) {
    case "published":
      return badge("Publikované", "accent");
    case "scheduled":
      return badge("Plánované", "muted");
    case "archived":
      return badge("Archivované", "dark");
    default:
      return badge("Draft", "muted");
  }
}

export function notificationResultBadge(
  status: NotificationStatus,
  finalChannel: NotificationChannel | null,
  preferredChannels: NotificationChannel[],
): BadgeCell {
  const primaryChannel = preferredChannels[0] ?? null;
  const usedFallback = finalChannel !== null && primaryChannel !== null && finalChannel !== primaryChannel;

  if (status === "delivered" || status === "sent") {
    return badge(usedFallback ? `Fallback ${finalChannel?.toUpperCase()}` : "Doručené", usedFallback ? "muted" : "accent");
  }

  if (status === "failed" || status === "exhausted") {
    return badge("Zlyhané", "dark");
  }

  return badge("Čaká", "muted");
}

export function notificationAttemptBadge(status: NotificationAttemptStatus): BadgeCell {
  if (status === "delivered" || status === "sent") {
    return badge("OK", "accent");
  }

  if (status === "provider_failed" || status === "undeliverable" || status === "rate_limited") {
    return badge("Retry", "dark");
  }

  return badge("Queued", "muted");
}

export function webhookStatusBadge(status: OutboxStatus, signatureValid: boolean): BadgeCell {
  if (status === "processed") {
    return badge(signatureValid ? "Spracované" : "Spracované bez podpisu", signatureValid ? "accent" : "muted");
  }

  if (status === "failed" || status === "dead_letter") {
    return badge("Incident", "dark");
  }

  return badge("Čaká", "muted");
}

export function auditResultBadge(hasAfterPayload: boolean): BadgeCell {
  return badge(hasAfterPayload ? "Zapísané" : "Sledované", toneFromBoolean(hasAfterPayload));
}
