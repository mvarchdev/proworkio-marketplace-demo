import { z } from "zod";
import { baseEnvSchema } from "./common";

export const webEnvSchema = baseEnvSchema.extend({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});
