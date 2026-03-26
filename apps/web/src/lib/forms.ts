import { z } from "zod";

const dynamicScalarSchema = z.union([z.string(), z.number(), z.boolean()]);
const uploadedAssetSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  altText: z.string().optional(),
});
const publicSubmissionMetaSchema = {
  startedAt: z.number().int().positive(),
  antiSpamHoney: z.string().max(0).optional().or(z.literal("")),
};

export const requestFormSchema = z.object({
  categoryId: z.string().min(1, "Vyberte kategóriu."),
  title: z.string().min(6, "Zadajte stručný názov dopytu.").max(140),
  description: z.string().min(30, "Popis musí mať aspoň 30 znakov.").max(3000),
  urgency: z.enum(["normal", "fast", "urgent"]),
  postalCode: z.string().min(4, "Zadajte PSČ."),
  locationLabel: z.string().min(2, "Zadajte lokalitu."),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  deadlineLabel: z.string().min(2, "Vyberte termín alebo urgentnosť."),
  dynamicValues: z.record(z.string(), z.union([dynamicScalarSchema, z.array(z.string())])),
  photos: z.array(uploadedAssetSchema),
  contactName: z.string().min(2, "Zadajte meno."),
  contactEmail: z.email("Zadajte platný e-mail."),
  contactPhone: z.string().min(7, "Zadajte telefón."),
  preferredChannel: z.enum(["email", "whatsapp", "sms"]),
  termsAccepted: z
    .boolean()
    .refine((value) => value, "Bez súhlasu s podmienkami nie je možné odoslať dopyt."),
  ...publicSubmissionMetaSchema,
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export const companyOnboardingSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug musí mať aspoň 3 znaky.")
    .regex(/^[a-z0-9-]+$/, "Slug môže obsahovať len malé písmená, čísla a pomlčky."),
  legalName: z.string().min(2, "Zadajte právny názov firmy."),
  displayName: z.string().min(2, "Zadajte názov, ktorý sa zobrazí verejne."),
  companyIdNumber: z.string().optional(),
  vatId: z.string().optional(),
  shortDescription: z.string().min(20, "Krátky popis musí mať aspoň 20 znakov.").max(240),
  longDescription: z.string().min(60, "Rozšírený popis musí mať aspoň 60 znakov.").max(4000),
  city: z.string().min(2, "Zadajte mesto."),
  postalCode: z.string().min(4, "Zadajte PSČ."),
  addressLine1: z.string().min(4, "Zadajte ulicu a číslo."),
  addressLine2: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().min(1000).max(300000),
  categoryIds: z.array(z.string().min(1)).min(1, "Vyberte aspoň jednu kategóriu."),
  contactName: z.string().min(2, "Zadajte kontaktnú osobu."),
  publicEmail: z.email("Zadajte platný verejný e-mail."),
  supportEmail: z.email().optional().or(z.literal("")),
  billingEmail: z.email().optional().or(z.literal("")),
  phone: z.string().min(7, "Zadajte telefón."),
  whatsappPhone: z.string().optional(),
  websiteUrl: z.url().optional().or(z.literal("")),
  logo: uploadedAssetSchema.optional(),
  heroImage: uploadedAssetSchema.optional(),
  fieldValues: z.record(z.string(), z.union([dynamicScalarSchema, z.array(z.string())])),
  gallery: z.array(uploadedAssetSchema),
  ...publicSubmissionMetaSchema,
});

export type CompanyOnboardingValues = z.infer<typeof companyOnboardingSchema>;

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Zadajte meno a priezvisko."),
  email: z.email("Zadajte platný e-mail."),
  password: z.string().min(8, "Heslo musí mať aspoň 8 znakov."),
});

export const signInSchema = z.object({
  email: z.email("Zadajte platný e-mail."),
  password: z.string().min(8, "Heslo musí mať aspoň 8 znakov."),
});

export const passwordResetSchema = z.object({
  email: z.email("Zadajte platný e-mail."),
});

export const checkoutSchema = z.object({
  companyId: z.string().min(1),
  requestId: z.string().min(1),
});

export const vipCheckoutSchema = z.object({
  companyId: z.string().min(1),
});
