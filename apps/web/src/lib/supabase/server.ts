import { createServerClient } from "@supabase/ssr";
import type { Database } from "@proworkio/types";
import { cookies } from "next/headers";

import { featureFlags, runtimeConfig } from "@/lib/platform";

export async function getRequestSupabaseClient() {
  if (!featureFlags.hasSupabasePublic) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    runtimeConfig.supabaseUrl,
    runtimeConfig.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Route handlers and server components can ignore cookie write failures.
          }
        },
      },
    },
  );
}
