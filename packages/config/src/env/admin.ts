import { z } from "zod";
import { baseEnvSchema } from "./common";

export const adminEnvSchema = baseEnvSchema.extend({
  NEXT_PUBLIC_ADMIN_APP_URL: z.url().optional(),
});
