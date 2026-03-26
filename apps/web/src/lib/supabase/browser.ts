"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@proworkio/types";

import { featureFlags, runtimeConfig } from "@/lib/platform";

let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserSupabaseClient() {
  if (!featureFlags.hasSupabasePublic) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      runtimeConfig.supabaseUrl,
      runtimeConfig.supabasePublishableKey,
    );
  }

  return browserClient;
}
