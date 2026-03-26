import { createClient } from "@supabase/supabase-js";
import type { Database } from "@proworkio/types";

import { featureFlags, runtimeConfig } from "@/lib/platform";

export function getServiceSupabaseClient() {
  if (!featureFlags.hasSupabaseService) {
    return null;
  }

  return createClient<Database>(runtimeConfig.supabaseUrl, runtimeConfig.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
