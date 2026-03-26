import { leadUnlockPrice, resolveFallbackPlan, vipMonthlyPlan } from "@proworkio/lib";
import type { Database, Json, NotificationAttempt, NotificationChannel, NotificationMessage } from "@proworkio/types";
import Stripe from "stripe";

import type { CompanyOnboardingValues, RequestFormValues } from "@/lib/forms";
import { featureFlags, runtimeConfig } from "@/lib/platform";
import { getRequestSupabaseClient } from "@/lib/supabase/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

const fallbackOrder = ["email", "whatsapp", "sms"] as const;

function toDatabaseJson(value: unknown): Json {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toDatabaseJson(entry));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, entry === undefined ? null : toDatabaseJson(entry)]),
    );
  }

  return String(value);
}

function normalizeStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): Database["public"]["Enums"]["subscription_status"] {
  switch (status) {
    case "active":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "trialing":
    case "unpaid":
      return status;
    case "paused":
      // The local state machine does not model "paused" separately, so keep it degradable but resumable.
      return "past_due";
    default:
      return "incomplete";
  }
}

function getStripeClient() {
  if (!featureFlags.hasStripeServer) {
    return null;
  }

  return new Stripe(runtimeConfig.stripeSecretKey);
}

async function insertNotificationMessage(args: {
  aggregateType: string;
  aggregateId?: string;
  templateCode: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientWhatsapp?: string;
  preferredChannels: Array<"email" | "whatsapp" | "sms">;
  fallbackChannels: Array<"email" | "whatsapp" | "sms">;
  payload: Record<string, string | number | boolean>;
}) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return { id: crypto.randomUUID(), persisted: false };
  }

  const { data, error } = await supabase
    .schema("ops")
    .from("notification_messages")
    .insert({
      aggregate_type: args.aggregateType,
      aggregate_id: args.aggregateId ?? null,
      template_code: args.templateCode,
      preferred_channels: args.preferredChannels,
      fallback_channels: args.fallbackChannels,
      recipient_name: args.recipientName ?? null,
      recipient_email: args.recipientEmail ?? null,
      recipient_phone: args.recipientPhone ?? null,
      recipient_whatsapp: args.recipientWhatsapp ?? null,
      payload: args.payload,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { id: crypto.randomUUID(), persisted: false };
  }

  return { id: String(data.id), persisted: true };
}

async function insertNotificationAttempt(
  messageId: string,
  attempt: {
    channel: "email" | "whatsapp" | "sms";
    provider: "resend" | "infobip";
    status:
      | "queued"
      | "sent"
      | "delivered"
      | "undeliverable"
      | "provider_failed"
      | "rate_limited"
      | "skipped";
    providerMessageId?: string;
    providerResponse?: Record<string, unknown>;
    errorCode?: string;
    errorMessage?: string;
    attemptNumber: number;
  },
) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return;
  }

  const insertPayload: Database["ops"]["Tables"]["notification_delivery_attempts"]["Insert"] = {
    message_id: messageId,
    channel: attempt.channel,
    provider: attempt.provider,
    status: attempt.status,
    attempt_number: attempt.attemptNumber,
    provider_message_id: attempt.providerMessageId ?? null,
    provider_response: attempt.providerResponse ? toDatabaseJson(attempt.providerResponse) : null,
    error_code: attempt.errorCode ?? null,
    error_message: attempt.errorMessage ?? null,
  };

  await supabase.schema("ops").from("notification_delivery_attempts").insert(insertPayload);
}

async function finalizeNotificationMessage(
  messageId: string,
  status: "delivered" | "failed" | "exhausted",
  finalChannel?: NotificationChannel,
) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.schema("ops").from("notification_messages").update({
    status,
    final_channel: finalChannel ?? null,
    sent_at: status === "delivered" ? new Date().toISOString() : null,
    failed_at: status !== "delivered" ? new Date().toISOString() : null,
  }).eq("id", messageId);
}

async function sendEmail(args: { to: string; subject: string; html: string; text: string }) {
  if (!featureFlags.hasResend) {
    return {
      ok: false,
      status: "skipped" as const,
      errorMessage: "Resend nie je nakonfigurovaný.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeConfig.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Proworkio <noreply@proworkio.local>",
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      status: "provider_failed" as const,
      errorMessage: String(payload.message ?? "Resend request failed."),
      providerResponse: payload,
    };
  }

  return {
    ok: true,
    status: "delivered" as const,
    providerMessageId: String(payload.id ?? ""),
    providerResponse: payload,
  };
}

async function sendSms(args: { to: string; text: string }) {
  if (!featureFlags.hasInfobip) {
    return {
      ok: false,
      status: "skipped" as const,
      errorMessage: "Infobip SMS nie je nakonfigurovaný.",
    };
  }

  const response = await fetch(`${runtimeConfig.infobipBaseUrl}/sms/3/messages`, {
    method: "POST",
    headers: {
      Authorization: `App ${runtimeConfig.infobipApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          sender: "Proworkio",
          destinations: [{ to: args.to }],
          content: { text: args.text },
        },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      ok: false,
      status: "provider_failed" as const,
      errorMessage: String(payload.requestError ?? payload.message ?? "Infobip SMS request failed."),
      providerResponse: payload,
    };
  }

  return {
    ok: true,
    status: "delivered" as const,
    providerMessageId: JSON.stringify(payload.messages ?? []),
    providerResponse: payload,
  };
}

async function sendWhatsapp(args: { to: string; text: string }) {
  if (!featureFlags.hasInfobip) {
    return {
      ok: false,
      status: "skipped" as const,
      errorMessage: "Infobip WhatsApp nie je nakonfigurovaný.",
    };
  }

  const response = await fetch(`${runtimeConfig.infobipBaseUrl}/messages-api/1/messages`, {
    method: "POST",
    headers: {
      Authorization: `App ${runtimeConfig.infobipApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          channel: "WHATSAPP",
          sender: "Proworkio",
          destinations: [{ to: args.to }],
          content: { text: args.text },
        },
      ],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      ok: false,
      status: "provider_failed" as const,
      errorMessage: String(payload.requestError ?? payload.message ?? "Infobip WhatsApp request failed."),
      providerResponse: payload,
    };
  }

  return {
    ok: true,
    status: "delivered" as const,
    providerMessageId: JSON.stringify(payload.messages ?? []),
    providerResponse: payload,
  };
}

export async function sendFallbackNotification(args: {
  aggregateType: string;
  aggregateId?: string;
  templateCode: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientWhatsapp?: string;
  preferredChannel?: "email" | "whatsapp" | "sms";
  subject: string;
  html: string;
  text: string;
  payload: Record<string, string | number | boolean>;
}) {
  const preferredChannels = args.preferredChannel
    ? [args.preferredChannel, ...fallbackOrder.filter((entry) => entry !== args.preferredChannel)]
    : [...fallbackOrder];

  const fallbackChannels = fallbackOrder.filter((entry) => !preferredChannels.includes(entry));
  const message = await insertNotificationMessage({
    aggregateType: args.aggregateType,
    templateCode: args.templateCode,
    preferredChannels,
    fallbackChannels,
    payload: args.payload,
    ...(args.aggregateId ? { aggregateId: args.aggregateId } : {}),
    ...(args.recipientName ? { recipientName: args.recipientName } : {}),
    ...(args.recipientEmail ? { recipientEmail: args.recipientEmail } : {}),
    ...(args.recipientPhone ? { recipientPhone: args.recipientPhone } : {}),
    ...(args.recipientWhatsapp ? { recipientWhatsapp: args.recipientWhatsapp } : {}),
  });

  const notificationMessage: NotificationMessage = {
    id: message.id,
    templateCode: args.templateCode,
    recipientId: args.aggregateId ?? message.id,
    recipientLabel: args.recipientName ?? args.recipientEmail ?? args.recipientPhone ?? "Príjemca",
    preferredChannels,
    payload: args.payload,
    status: "queued",
  };

  const history: NotificationAttempt[] = [];
  const plan = resolveFallbackPlan(
    notificationMessage,
    {
      email: Boolean(args.recipientEmail),
      sms: Boolean(args.recipientPhone),
      whatsapp: Boolean(args.recipientWhatsapp ?? args.recipientPhone),
    },
    history,
  );

  for (const [index, channel] of plan.entries()) {
    if (channel === "email" && args.recipientEmail) {
      const result = await sendEmail({
        to: args.recipientEmail,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });

      await insertNotificationAttempt(message.id, {
        channel,
        provider: "resend",
        status: result.status,
        attemptNumber: index + 1,
        ...(result.ok && result.providerMessageId ? { providerMessageId: result.providerMessageId } : {}),
        ...(result.providerResponse ? { providerResponse: result.providerResponse } : {}),
        ...(!result.ok && result.errorMessage ? { errorMessage: result.errorMessage } : {}),
      });

      if (result.ok) {
        await finalizeNotificationMessage(message.id, "delivered", channel);
        return { messageId: message.id, finalChannel: channel, delivered: true };
      }
    }

    if (channel === "sms" && args.recipientPhone) {
      const result = await sendSms({
        to: args.recipientPhone,
        text: args.text,
      });

      await insertNotificationAttempt(message.id, {
        channel,
        provider: "infobip",
        status: result.status,
        attemptNumber: index + 1,
        ...(result.ok && result.providerMessageId ? { providerMessageId: result.providerMessageId } : {}),
        ...(result.providerResponse ? { providerResponse: result.providerResponse } : {}),
        ...(!result.ok && result.errorMessage ? { errorMessage: result.errorMessage } : {}),
      });

      if (result.ok) {
        await finalizeNotificationMessage(message.id, "delivered", channel);
        return { messageId: message.id, finalChannel: channel, delivered: true };
      }
    }

    if (channel === "whatsapp" && (args.recipientWhatsapp ?? args.recipientPhone)) {
      const result = await sendWhatsapp({
        to: args.recipientWhatsapp ?? args.recipientPhone!,
        text: args.text,
      });

      await insertNotificationAttempt(message.id, {
        channel,
        provider: "infobip",
        status: result.status,
        attemptNumber: index + 1,
        ...(result.ok && result.providerMessageId ? { providerMessageId: result.providerMessageId } : {}),
        ...(result.providerResponse ? { providerResponse: result.providerResponse } : {}),
        ...(!result.ok && result.errorMessage ? { errorMessage: result.errorMessage } : {}),
      });

      if (result.ok) {
        await finalizeNotificationMessage(message.id, "delivered", channel);
        return { messageId: message.id, finalChannel: channel, delivered: true };
      }
    }
  }

  await finalizeNotificationMessage(message.id, "exhausted");
  return { messageId: message.id, delivered: false };
}

function buildRequestPayload(values: RequestFormValues) {
  return {
    category_id: values.categoryId,
    title: values.title,
    description: values.description,
    urgency: values.urgency,
    postal_code: values.postalCode,
    location_label: values.locationLabel,
    latitude: values.latitude,
    longitude: values.longitude,
    duplicate_fingerprint: `${values.categoryId}|${values.title}|${values.postalCode}|${values.contactEmail}`,
    contact_name: values.contactName,
    contact_email: values.contactEmail,
    contact_phone: values.contactPhone,
    preferred_channel: values.preferredChannel,
    field_values: Object.entries(values.dynamicValues).map(([field_definition_id, value]) => ({
      field_definition_id,
      value,
    })),
    photos: values.photos.map((photo, index) => ({
      bucket: photo.bucket,
      path: photo.path,
      alt_text_sk: photo.altText,
      sort_order: index,
    })),
    metadata: {
      deadlineLabel: values.deadlineLabel,
    },
  };
}

export async function submitGuestRequestWorkflow(values: RequestFormValues) {
  if (!featureFlags.hasSupabaseService) {
    const requestId = crypto.randomUUID();
    const publicCode = `DOPYT-${requestId.slice(0, 8).toUpperCase()}`;
    return {
      requestId,
      publicCode,
      confirmationLink: `${runtimeConfig.appUrl}/potvrdit-dopyt?token=demo-${requestId}`,
      claimLink: `${runtimeConfig.appUrl}/prevziat-dopyt?token=demo-${requestId}`,
      mode: "demo" as const,
    };
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase service client is not available.");
  }

  const { data, error } = await supabase.rpc("submit_guest_request", {
    input: buildRequestPayload(values),
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    throw new Error("Request workflow did not return identifiers.");
  }

  const confirmationLink = `${runtimeConfig.appUrl}/potvrdit-dopyt?token=${encodeURIComponent(String(result.confirmation_token))}`;
  const claimLink = `${runtimeConfig.appUrl}/prevziat-dopyt?token=${encodeURIComponent(String(result.claim_token))}`;

  await sendFallbackNotification({
    aggregateType: "request",
    aggregateId: String(result.request_id),
    templateCode: "request.confirmation",
    recipientName: values.contactName,
    recipientEmail: values.contactEmail,
    recipientPhone: values.contactPhone,
    recipientWhatsapp: values.contactPhone,
    preferredChannel: values.preferredChannel,
    subject: "Potvrďte svoj dopyt na Proworkio",
    text: `Dobrý deň ${values.contactName}, potvrďte svoj dopyt kliknutím na odkaz: ${confirmationLink}`,
    html: `<p>Dobrý deň ${values.contactName},</p><p>váš dopyt <strong>${String(result.public_code)}</strong> čaká na potvrdenie.</p><p><a href="${confirmationLink}">Potvrdiť dopyt</a></p><p>Po potvrdení budete vedieť dopyt neskôr priradiť k účtu cez odkaz: <a href="${claimLink}">Prevziať dopyt do účtu</a>.</p>`,
    payload: {
      publicCode: String(result.public_code),
      confirmationLink,
      claimLink,
    },
  });

  return {
    requestId: String(result.request_id),
    publicCode: String(result.public_code),
    confirmationLink,
    claimLink,
    mode: "database" as const,
  };
}

function buildCompanyPayload(values: CompanyOnboardingValues) {
  return {
    slug: values.slug,
    legal_name: values.legalName,
    display_name: values.displayName,
    company_id_number: values.companyIdNumber,
    vat_id: values.vatId,
    short_description_sk: values.shortDescription,
    long_description_sk: values.longDescription,
    city: values.city,
    postal_code: values.postalCode,
    address_line_1: values.addressLine1,
    address_line_2: values.addressLine2,
    latitude: values.latitude,
    longitude: values.longitude,
    radius_meters: values.radiusMeters,
    category_ids: values.categoryIds,
    contact_name: values.contactName,
    public_email: values.publicEmail,
    support_email: values.supportEmail || undefined,
    billing_email: values.billingEmail || undefined,
    phone: values.phone,
    whatsapp_phone: values.whatsappPhone,
    website_url: values.websiteUrl || undefined,
    ...(values.logo
      ? {
          logo_bucket: values.logo.bucket,
          logo_path: values.logo.path,
        }
      : {}),
    ...(values.heroImage
      ? {
          hero_image_path: values.heroImage.path,
        }
      : {}),
    field_values: Object.entries(values.fieldValues).map(([field_definition_id, value]) => ({
      field_definition_id,
      value,
    })),
    gallery: values.gallery.map((entry, index) => ({
      bucket: entry.bucket,
      path: entry.path,
      alt_text_sk: entry.altText,
      sort_order: index,
    })),
  };
}

export async function upsertCompanyWorkflow(values: CompanyOnboardingValues) {
  const authClient = await getRequestSupabaseClient();
  const userResult = authClient ? await authClient.auth.getUser() : null;
  const user = userResult?.data.user ?? null;

  if (!featureFlags.hasSupabaseService || !user) {
    return {
      companyId: crypto.randomUUID(),
      slug: values.slug,
      mode: "demo" as const,
    };
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase service client is not available.");
  }

  const { data, error } = await supabase.rpc("upsert_company_profile", {
    input: buildCompanyPayload(values),
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    companyId: String(result.id),
    slug: String(result.slug),
    mode: "database" as const,
  };
}

async function getOrCreateCompanyBillingAccount(companyId: string, email: string) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return { id: `demo-account-${companyId}` };
  }

  const existing = await supabase
    .schema("billing")
    .from("accounts")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (existing.data?.id) {
    return { id: String(existing.data.id) };
  }

  const inserted = await supabase
    .schema("billing")
    .from("accounts")
    .insert({
      owner_type: "company",
      company_id: companyId,
      email,
    })
    .select("id")
    .single();

  if (inserted.error || !inserted.data?.id) {
    throw new Error(inserted.error?.message ?? "Billing account could not be created.");
  }

  return { id: String(inserted.data.id) };
}

async function syncInvoiceDocument(args: {
  billingAccountId: string;
  paymentId: string;
  totalCents: number;
  email: string;
  legalName: string;
  publicUrlFallback: string;
}) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return;
  }

  if (!featureFlags.hasFakturownia) {
    await supabase.schema("billing").from("invoices").insert({
      billing_account_id: args.billingAccountId,
      payment_id: args.paymentId,
      status: "paid",
      external_invoice_id: `mock-${args.paymentId}`,
      external_number: `LOCAL/${new Date().getFullYear()}/${args.paymentId.slice(0, 6)}`,
      public_url: args.publicUrlFallback,
      issued_at: new Date().toISOString(),
      total_cents: args.totalCents,
    });
    return;
  }

  const response = await fetch(`${runtimeConfig.fakturowniaBaseUrl}/invoices.json`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_token: runtimeConfig.fakturowniaApiToken,
      invoice: {
        kind: "vat",
        issue_date: new Date().toISOString().slice(0, 10),
        sell_date: new Date().toISOString().slice(0, 10),
        payment_to_kind: 7,
        buyer_name: args.legalName,
        buyer_email: args.email,
        positions: [
          {
            name: "Proworkio lead unlock",
            total_price_gross: args.totalCents / 100,
            quantity: 1,
            tax: 23,
          },
        ],
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  const invoiceInsert: Database["billing"]["Tables"]["invoices"]["Insert"] = {
    billing_account_id: args.billingAccountId,
    payment_id: args.paymentId,
    status: response.ok ? "issued" : "failed_sync",
    external_invoice_id: payload.id ? String(payload.id) : null,
    external_number: payload.number ? String(payload.number) : null,
    public_url: payload.view_url ? String(payload.view_url) : args.publicUrlFallback,
    issued_at: new Date().toISOString(),
    total_cents: args.totalCents,
    metadata: toDatabaseJson(payload),
  };

  await supabase.schema("billing").from("invoices").insert(invoiceInsert);
}

async function resolveAuthenticatedCompany(companyId: string) {
  const authClient = await getRequestSupabaseClient();
  const userResult = authClient ? await authClient.auth.getUser() : null;
  const user = userResult?.data.user ?? null;

  if (!user) {
    return null;
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return { userId: user.id, email: user.email ?? "demo@proworkio.local", company: null };
  }

  const membershipQuery = supabase
    .from("company_members")
    .select("company_id")
    .eq("profile_id", user.id)
    .limit(1);

  const membership =
    companyId === "current"
      ? await membershipQuery.maybeSingle()
      : await membershipQuery.eq("company_id", companyId).maybeSingle();

  if (membership.error || !membership.data?.company_id) {
    return null;
  }

  const companyResult = await supabase
    .from("companies")
    .select("id, display_name, legal_name")
    .eq("id", companyId)
    .single();

  return {
    userId: user.id,
    email: user.email ?? "billing@proworkio.local",
    company: companyResult.data ?? null,
  };
}

export async function startLeadUnlockCheckout(companyId: string, requestId: string) {
  const context = await resolveAuthenticatedCompany(companyId);
  if (!context) {
    throw new Error("Nemáte oprávnenie pracovať s touto firmou.");
  }

  const supabase = getServiceSupabaseClient();
  const billingAccount = await getOrCreateCompanyBillingAccount(companyId, context.email);

  if (!featureFlags.hasSupabaseService || !supabase || !featureFlags.hasStripeServer) {
    const inserted = supabase
      ? await supabase.schema("billing").from("payments").insert({
          billing_account_id: billingAccount.id,
          company_id: companyId,
          request_id: requestId,
          purpose: "lead_unlock",
          status: "succeeded",
          amount_cents: leadUnlockPrice.amountCents,
          succeeded_at: new Date().toISOString(),
        }).select("id").single()
      : null;

    const paymentId = inserted?.data?.id ? String(inserted.data.id) : `mock-payment-${requestId}`;

    if (supabase) {
      await supabase.schema("billing").from("lead_unlock_entitlements").upsert({
        request_id: requestId,
        company_id: companyId,
        payment_id: paymentId,
        status: "active",
        amount_cents: leadUnlockPrice.amountCents,
        granted_at: new Date().toISOString(),
      }, { onConflict: "request_id,company_id" });

      await syncInvoiceDocument({
        billingAccountId: billingAccount.id,
        paymentId,
        totalCents: leadUnlockPrice.amountCents,
        email: context.email,
        legalName: context.company?.legal_name ?? "Proworkio firma",
        publicUrlFallback: `${runtimeConfig.adminUrl}/platby`,
      });
    }

    return {
      url: `${runtimeConfig.appUrl}/dashboard/firma/prilezitosti?unlock=success&requestId=${requestId}`,
      mode: "mock",
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe client is not available.");
  }

  const paymentInsert = await supabase.schema("billing").from("payments").insert({
    billing_account_id: billingAccount.id,
    company_id: companyId,
    request_id: requestId,
    purpose: "lead_unlock",
    status: "pending",
    amount_cents: leadUnlockPrice.amountCents,
  }).select("id").single();

  if (paymentInsert.error || !paymentInsert.data?.id) {
    throw new Error(paymentInsert.error?.message ?? "Payment record could not be created.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${runtimeConfig.appUrl}/dashboard/firma/prilezitosti?unlock=success&requestId=${requestId}`,
    cancel_url: `${runtimeConfig.appUrl}/dashboard/firma/prilezitosti?unlock=cancelled`,
    customer_creation: "always",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: leadUnlockPrice.currency,
          product_data: {
            name: leadUnlockPrice.title,
            description: leadUnlockPrice.description,
          },
          unit_amount: leadUnlockPrice.amountCents,
        },
      },
    ],
    metadata: {
      paymentId: String(paymentInsert.data.id),
      companyId,
      requestId,
      purpose: "lead_unlock",
    },
  });

  await supabase.schema("billing").from("payments").update({
    checkout_session_id: session.id,
  }).eq("id", paymentInsert.data.id);

  return { url: session.url ?? `${runtimeConfig.appUrl}/dashboard/firma/prilezitosti`, mode: "stripe" };
}

export async function startVipCheckout(companyId: string) {
  const context = await resolveAuthenticatedCompany(companyId);
  if (!context) {
    throw new Error("Nemáte oprávnenie pracovať s touto firmou.");
  }

  const supabase = getServiceSupabaseClient();
  const billingAccount = await getOrCreateCompanyBillingAccount(companyId, context.email);

  if (!featureFlags.hasSupabaseService || !supabase || !featureFlags.hasStripeServer) {
    await supabase?.schema("billing").from("subscriptions").upsert({
      billing_account_id: billingAccount.id,
      company_id: companyId,
      plan_code: "vip_monthly",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "company_id" });

    return {
      url: `${runtimeConfig.appUrl}/dashboard/firma?vip=success`,
      mode: "mock",
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe client is not available.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${runtimeConfig.appUrl}/dashboard/firma?vip=success`,
    cancel_url: `${runtimeConfig.appUrl}/dashboard/firma?vip=cancelled`,
    customer_creation: "always",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: vipMonthlyPlan.currency,
          recurring: { interval: "month" },
          product_data: {
            name: vipMonthlyPlan.title,
            description: vipMonthlyPlan.description,
          },
          unit_amount: vipMonthlyPlan.amountCents,
        },
      },
    ],
    metadata: {
      companyId,
      billingAccountId: billingAccount.id,
      purpose: "vip_subscription",
    },
  });

  return { url: session.url ?? `${runtimeConfig.appUrl}/dashboard/firma`, mode: "stripe" };
}

export async function createBillingPortal(companyId: string) {
  const context = await resolveAuthenticatedCompany(companyId);
  if (!context) {
    throw new Error("Nemáte oprávnenie pracovať s touto firmou.");
  }

  const supabase = getServiceSupabaseClient();
  const stripe = getStripeClient();
  if (!supabase || !stripe) {
    return `${runtimeConfig.appUrl}/dashboard/firma?navigated=portal`;
  }

  const account = await supabase
    .schema("billing")
    .from("accounts")
    .select("stripe_customer_id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (!account.data?.stripe_customer_id) {
    return `${runtimeConfig.appUrl}/dashboard/firma?navigated=portal`;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: String(account.data.stripe_customer_id),
    return_url: `${runtimeConfig.appUrl}/dashboard/firma`,
  });

  return session.url;
}

export async function processStripeWebhook(rawBody: string, signature: string | null) {
  const supabase = getServiceSupabaseClient();
  const stripe = getStripeClient();
  if (!supabase) {
    return { processed: false, reason: "missing_supabase" };
  }

  let event: Stripe.Event;
  let signatureValid = false;

  if (stripe && featureFlags.hasStripeServer && runtimeConfig.stripeWebhookSecret && signature) {
    event = stripe.webhooks.constructEvent(rawBody, signature, runtimeConfig.stripeWebhookSecret);
    signatureValid = true;
  } else {
    event = JSON.parse(rawBody) as Stripe.Event;
  }

  const webhookEventUpsert: Database["ops"]["Tables"]["webhook_events"]["Insert"] = {
    provider: "stripe",
    provider_event_id: event.id,
    event_type: event.type,
    signature_valid: signatureValid,
    status: "processing",
    payload: toDatabaseJson(event),
  };

  await supabase
    .schema("ops")
    .from("webhook_events")
    .upsert(webhookEventUpsert, { onConflict: "provider,provider_event_id" });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};
    const paymentId = metadata.paymentId;
    if (paymentId) {
      await supabase.schema("billing").from("payments").update({
        status: "succeeded",
        payment_intent_id: session.payment_intent ? String(session.payment_intent) : null,
        checkout_session_id: session.id,
        succeeded_at: new Date().toISOString(),
      }).eq("id", paymentId);

      if (metadata.purpose === "lead_unlock" && metadata.requestId && metadata.companyId) {
        await supabase.schema("billing").from("lead_unlock_entitlements").upsert({
          request_id: metadata.requestId,
          company_id: metadata.companyId,
          payment_id: paymentId,
          status: "active",
          amount_cents: leadUnlockPrice.amountCents,
          granted_at: new Date().toISOString(),
        }, { onConflict: "request_id,company_id" });
      }
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const companyId = subscription.metadata?.companyId;
    const billingAccountId = subscription.metadata?.billingAccountId;
    if (companyId && billingAccountId) {
      const subscriptionUpsert: Database["billing"]["Tables"]["subscriptions"]["Insert"] = {
        billing_account_id: billingAccountId,
        company_id: companyId,
        stripe_subscription_id: subscription.id,
        status: normalizeStripeSubscriptionStatus(subscription.status),
        current_period_start: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
          : null,
        current_period_end: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      };

      await supabase.schema("billing").from("subscriptions").upsert(subscriptionUpsert, { onConflict: "company_id" });
    }
  }

  await supabase.schema("ops").from("webhook_events").update({
    status: "processed",
    processed_at: new Date().toISOString(),
  }).eq("provider", "stripe").eq("provider_event_id", event.id);

  return { processed: true, eventType: event.type };
}
