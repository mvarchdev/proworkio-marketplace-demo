"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Category } from "@proworkio/types";
import { Button, Card, Input, Label, Textarea } from "@proworkio/ui";

import { companyOnboardingSchema, type CompanyOnboardingValues } from "@/lib/forms";
import { uploadMarketplaceAsset } from "@/lib/uploads";

const defaultValues: CompanyOnboardingValues = {
  slug: "",
  legalName: "",
  displayName: "",
  companyIdNumber: "",
  vatId: "",
  shortDescription: "",
  longDescription: "",
  city: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  radiusMeters: 25000,
  categoryIds: [],
  contactName: "",
  publicEmail: "",
  supportEmail: "",
  billingEmail: "",
  phone: "",
  whatsappPhone: "",
  websiteUrl: "",
  fieldValues: {},
  gallery: [],
  startedAt: Date.now(),
  antiSpamHoney: "",
};

export function CompanyOnboardingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyOnboardingValues>({
    resolver: zodResolver(companyOnboardingSchema),
    defaultValues,
    mode: "onTouched",
  });
  const selectedCategoryIds = form.watch("categoryIds");

  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedCategoryIds.includes(category.id)),
    [categories, selectedCategoryIds],
  );

  async function uploadLogo(file: File | null) {
    if (!file) {
      return;
    }

    try {
      const uploaded = await uploadMarketplaceAsset(file, "company-asset");
      form.setValue("logo", uploaded, { shouldDirty: true });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Logo sa nepodarilo nahrať.");
    }
  }

  async function uploadGallery(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadMarketplaceAsset(file, "company-asset")),
      );
      form.setValue("gallery", [...form.getValues("gallery"), ...uploaded], { shouldDirty: true });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Galériu sa nepodarilo nahrať.");
    }
  }

  async function handleNextStep() {
    const valid = await form.trigger([
      "displayName",
      "legalName",
      "slug",
      "shortDescription",
      "longDescription",
      "categoryIds",
    ]);
    if (!valid) {
      return;
    }

    setStep(1);
  }

  async function handleSubmit(values: CompanyOnboardingValues) {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok || !payload.slug) {
        throw new Error(payload.error ?? "Firmu sa nepodarilo uložiť.");
      }

      router.push(`/dashboard/firma?slug=${payload.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Firmu sa nepodarilo uložiť.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Onboarding firmy</p>
          <h1 className="mt-2 text-3xl font-black text-[#1E1F48]">Profil firmy pripravený na moderáciu</h1>
        </div>
        <div className="flex gap-2">
          {[0, 1].map((index) => (
            <div
              key={index}
              className={`h-2.5 w-16 rounded-full ${index <= step ? "bg-[#2E5ACF]" : "bg-[#DDE1F7]"}`}
            />
          ))}
        </div>
      </div>

      <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
        <input type="hidden" {...form.register("antiSpamHoney")} />
        <input type="hidden" {...form.register("startedAt", { valueAsNumber: true })} />
        {step === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="displayName">Verejný názov</Label>
              <Input id="displayName" placeholder="Ateliér Farba" {...form.register("displayName")} />
            </div>
            <div>
              <Label htmlFor="legalName">Právny názov</Label>
              <Input id="legalName" placeholder="Ateliér Farba s.r.o." {...form.register("legalName")} />
            </div>
            <div>
              <Label htmlFor="slug">Slug profilu</Label>
              <Input id="slug" placeholder="atelier-farba" {...form.register("slug")} />
            </div>
            <div>
              <Label htmlFor="companyIdNumber">IČO</Label>
              <Input id="companyIdNumber" placeholder="12345678" {...form.register("companyIdNumber")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shortDescription">Krátky popis</Label>
              <Textarea id="shortDescription" rows={4} {...form.register("shortDescription")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="longDescription">Dlhý popis</Label>
              <Textarea id="longDescription" rows={7} {...form.register("longDescription")} />
            </div>
            <div className="md:col-span-2">
              <Label>Kategórie</Label>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className={`rounded-2xl border px-4 py-4 text-sm transition ${checked ? "border-[#2E5ACF] bg-[#EEF2FF]" : "border-[#D6DBF1] bg-white"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...form.getValues("categoryIds"), category.id]
                            : form.getValues("categoryIds").filter((value) => value !== category.id);
                          form.setValue("categoryIds", next);
                        }}
                        className="sr-only"
                      />
                      <span className="font-semibold text-[#1E1F48]">{category.name}</span>
                      <p className="mt-1 text-xs text-[#1E1F48]/60">{category.shortDescription}</p>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="logoUpload">Logo</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  await uploadLogo(event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
              {form.watch("logo") ? (
                <p className="mt-2 text-xs text-[#1E1F48]/60">
                  Nahraté logo: {form.watch("logo")?.altText ?? form.watch("logo")?.path.split("/").pop()}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="city">Mesto</Label>
              <Input id="city" placeholder="Bratislava" {...form.register("city")} />
            </div>
            <div>
              <Label htmlFor="postalCode">PSČ</Label>
              <Input id="postalCode" placeholder="821 05" {...form.register("postalCode")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addressLine1">Adresa</Label>
              <Input id="addressLine1" placeholder="Prievozská 14" {...form.register("addressLine1")} />
            </div>
            <div>
              <Label htmlFor="contactName">Kontaktná osoba</Label>
              <Input id="contactName" placeholder="Juraj Kováč" {...form.register("contactName")} />
            </div>
            <div>
              <Label htmlFor="publicEmail">Verejný e-mail</Label>
              <Input id="publicEmail" type="email" placeholder="info@firma.sk" {...form.register("publicEmail")} />
            </div>
            <div>
              <Label htmlFor="billingEmail">Fakturačný e-mail</Label>
              <Input id="billingEmail" type="email" placeholder="faktury@firma.sk" {...form.register("billingEmail")} />
            </div>
            <div>
              <Label htmlFor="phone">Telefón</Label>
              <Input id="phone" placeholder="+421 900 000 000" {...form.register("phone")} />
            </div>
            <div>
              <Label htmlFor="websiteUrl">Web</Label>
              <Input id="websiteUrl" placeholder="https://firma.sk" {...form.register("websiteUrl")} />
            </div>
            <div>
              <Label htmlFor="radiusMeters">Servisný rádius (m)</Label>
              <Input
                id="radiusMeters"
                type="number"
                {...form.register("radiusMeters", { valueAsNumber: true })}
              />
            </div>
            {selectedCategories.flatMap((category) => category.companyFields).map((field) => (
              <div key={field.id}>
                <Label htmlFor={`company-field-${field.id}`}>{field.label}</Label>
                <Input
                  id={`company-field-${field.id}`}
                  type={field.type === "number" ? "number" : "text"}
                  onChange={(event) =>
                    form.setValue(
                      `fieldValues.${field.id}`,
                      field.type === "number" ? Number(event.target.value) : event.target.value,
                    )
                  }
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label htmlFor="galleryUpload">Galéria realizácií</Label>
              <Input
                id="galleryUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={async (event) => {
                  await uploadGallery(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {form.watch("gallery").map((entry) => (
                  <span
                    key={entry.path}
                    className="rounded-full bg-[#EEF0FD] px-3 py-1 text-xs font-semibold text-[#1E1F48]"
                  >
                    {entry.altText ?? entry.path.split("/").pop()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || submitting}>
            Späť
          </Button>
          {step === 0 ? (
            <Button type="button" onClick={() => void handleNextStep()}>
              Pokračovať
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Ukladám profil..." : "Uložiť firemný profil"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
