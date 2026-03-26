export const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://127.0.0.1:3001",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

export const featureFlags = {
  hasSupabasePublic:
    runtimeConfig.supabaseUrl.length > 0 && runtimeConfig.supabasePublishableKey.length > 0,
  hasSupabaseService:
    runtimeConfig.supabaseUrl.length > 0 &&
    runtimeConfig.supabasePublishableKey.length > 0 &&
    runtimeConfig.supabaseServiceRoleKey.length > 0,
};

export const adminRuntimeMode = featureFlags.hasSupabaseService ? "live" : "fallback";
