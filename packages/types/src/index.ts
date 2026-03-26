import type { Database, Json } from "./database.generated";

export type {
  Database,
  Json,
};

export const userRoles = ["customer", "company_member", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const requestStatuses = [
  "draft",
  "awaiting_confirmation",
  "active",
  "expired",
  "closed",
  "archived",
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const requestConfirmationStatuses = [
  "pending",
  "confirmed",
  "expired",
] as const;
export type RequestConfirmationStatus = (typeof requestConfirmationStatuses)[number];

export const companyStatuses = [
  "draft",
  "pending_verification",
  "pending_review",
  "active",
  "suspended",
  "rejected",
  "archived",
] as const;
export type CompanyStatus = (typeof companyStatuses)[number];

export const moderationStatuses = [
  "unreviewed",
  "approved",
  "rejected",
  "needs_changes",
] as const;
export type ModerationStatus = (typeof moderationStatuses)[number];

export const notificationChannels = ["email", "whatsapp", "sms"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationStatuses = [
  "queued",
  "processing",
  "sent",
  "delivered",
  "failed",
  "exhausted",
] as const;
export type NotificationStatus = (typeof notificationStatuses)[number];

export const paymentStatuses = [
  "created",
  "pending",
  "requires_action",
  "succeeded",
  "failed",
  "refunded",
  "canceled",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const subscriptionStatuses = [
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const reviewStatuses = ["pending", "approved", "rejected", "hidden"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CategoryOption {
  label: string;
  value: string;
  description?: string;
}

export type DynamicFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select"
  | "boolean"
  | "date"
  | "file";

export interface CategoryFieldDefinition {
  id: string;
  fieldKey: string;
  label: string;
  helpText?: string;
  type: DynamicFieldType;
  required: boolean;
  options?: CategoryOption[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  depth: number;
  parentId?: string;
  icon: string;
  requestFields: CategoryFieldDefinition[];
  companyFields: CategoryFieldDefinition[];
}

export interface RequestContact {
  name: string;
  email: string;
  phone: string;
  preferredChannel: NotificationChannel;
}

export interface RequestDraftInput {
  categoryId: string;
  title: string;
  description: string;
  urgency: "normal" | "fast" | "urgent";
  postalCode: string;
  locationLabel: string;
  location?: GeoPoint;
  deadlineLabel: string;
  dynamicValues: Record<string, string | number | boolean | string[]>;
  photos: string[];
  contact: RequestContact;
  termsAccepted: boolean;
}

export interface RequestRecord extends RequestDraftInput {
  id: string;
  status: RequestStatus;
  confirmationStatus: RequestConfirmationStatus;
  createdAt: string;
  publishedAt?: string;
  budgetLabel?: string;
}

export interface CompanyPublicProfile {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  logoUrl?: string;
  heroImageUrl?: string;
  shortDescription: string;
  longDescription: string;
  city: string;
  radiusKm: number;
  categories: string[];
  gallery: string[];
  rating100: number;
  reviewsCount: number;
  vip: boolean;
  status: CompanyStatus;
  moderationStatus: ModerationStatus;
}

export interface MatchExplanation {
  eligible: boolean;
  score: number;
  distanceMeters: number | null;
  reasons: string[];
}

export interface ProviderOpportunity {
  id: string;
  requestId: string;
  title: string;
  categoryName: string;
  locality: string;
  budgetLabel: string;
  match: MatchExplanation;
  unlockPriceCents: number;
  isUnlocked: boolean;
}

export interface LeadUnlockEntitlement {
  id: string;
  requestId: string;
  companyId: string;
  status: "pending_payment" | "active" | "refunded" | "revoked" | "expired";
  paymentId?: string;
  grantedAt?: string;
}

export interface PaymentRecord {
  id: string;
  provider: "stripe";
  status: PaymentStatus;
  amountCents: number;
  currency: "eur";
  purpose: "lead_unlock" | "vip_subscription";
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  companyId: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface InvoiceRecord {
  id: string;
  provider: "fakturownia";
  status: "draft" | "issued" | "paid" | "overdue" | "void" | "failed_sync";
  number?: string;
  publicUrl?: string;
}

export interface NotificationTemplate {
  code: string;
  title: string;
  channels: NotificationChannel[];
}

export interface NotificationMessage {
  id: string;
  templateCode: string;
  recipientId: string;
  recipientLabel: string;
  preferredChannels: NotificationChannel[];
  payload: Record<string, string | number | boolean>;
  status: NotificationStatus;
}

export interface NotificationAttempt {
  id: string;
  messageId: string;
  channel: NotificationChannel;
  status:
    | "queued"
    | "sent"
    | "delivered"
    | "undeliverable"
    | "provider_failed"
    | "rate_limited"
    | "skipped";
  attemptedAt: string;
  providerMessageId?: string;
  failureReason?: string;
}

export interface BlogPostPreview {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  publishedAt: string;
  readingMinutes: number;
}

export interface ReviewRecord {
  id: string;
  companyId: string;
  authorName: string;
  rating100: number;
  title: string;
  body: string;
  status: ReviewStatus;
  publishedAt: string;
}

export interface PublicHomepageSnapshot {
  latestRequests: RequestRecord[];
  featuredCompanies: CompanyPublicProfile[];
  blogPosts: BlogPostPreview[];
  stats: Array<{
    label: string;
    value: string;
    description: string;
  }>;
}
