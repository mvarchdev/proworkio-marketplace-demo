export const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://127.0.0.1:3001",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  infobipBaseUrl: process.env.INFOBIP_BASE_URL ?? "",
  infobipApiKey: process.env.INFOBIP_API_KEY ?? "",
  fakturowniaBaseUrl: process.env.FAKTUROWNIA_BASE_URL ?? "",
  fakturowniaApiToken: process.env.FAKTUROWNIA_API_TOKEN ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN ?? "",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
};

export const featureFlags = {
  hasSupabasePublic:
    runtimeConfig.supabaseUrl.length > 0 && runtimeConfig.supabasePublishableKey.length > 0,
  hasSupabaseService:
    runtimeConfig.supabaseUrl.length > 0 &&
    runtimeConfig.supabasePublishableKey.length > 0 &&
    runtimeConfig.supabaseServiceRoleKey.length > 0,
  hasStripeServer: runtimeConfig.stripeSecretKey.length > 0,
  hasResend: runtimeConfig.resendApiKey.length > 0,
  hasInfobip: runtimeConfig.infobipBaseUrl.length > 0 && runtimeConfig.infobipApiKey.length > 0,
  hasFakturownia:
    runtimeConfig.fakturowniaBaseUrl.length > 0 && runtimeConfig.fakturowniaApiToken.length > 0,
};

export const isDemoMode = !featureFlags.hasSupabaseService;

