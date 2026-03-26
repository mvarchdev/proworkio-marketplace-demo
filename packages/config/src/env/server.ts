import { baseEnvSchema } from "./common";
import { z } from "zod";

export const serverEnvSchema = baseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  INFOBIP_BASE_URL: z.url().optional(),
  INFOBIP_API_KEY: z.string().min(1).optional(),
  FAKTUROWNIA_BASE_URL: z.url().optional(),
  FAKTUROWNIA_API_TOKEN: z.string().min(1).optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
});
