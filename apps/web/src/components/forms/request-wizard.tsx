"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import type { Category } from "@proworkio/types";
import { Button, Card, Input, Label, Textarea } from "@proworkio/ui";

import { requestFormSchema, type RequestFormValues } from "@/lib/forms";
import { uploadMarketplaceAsset } from "@/lib/uploads";

const draftStorageKey = "proworkio.request-draft.v1";

const defaultValues: RequestFormValues = {
  categoryId: "",
  title: "",
  description: "",
  urgency: "normal",
  postalCode: "",
  locationLabel: "",
  deadlineLabel: "",
  dynamicValues: {},
  photos: [],
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  preferredChannel: "email",
  termsAccepted: true,
  startedAt: Date.now(),
  antiSpamHoney: "",
};

export function RequestWizard({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const selectedCategoryId = form.watch("categoryId");

  useEffect(() => {
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<RequestFormValues>;
      form.reset({ ...defaultValues, ...parsed });
    } catch {
      // Ignore corrupted local drafts.
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const selectedCategory = useMemo(
    () => categories.find((entry) => entry.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadMarketplaceAsset(file, "request-photo")),
      );

      form.setValue("photos", [...form.getValues("photos"), ...uploaded], { shouldDirty: true });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Fotky sa nepodarilo nahrať.");
    }
  }

  async function handleNextStep() {
    const fields =
      step === 0
        ? (["categoryId", "title", "description"] as const)
        : (["postalCode", "locationLabel", "urgency", "deadlineLabel"] as const);

    const valid = await form.trigger(fields);
    if (!valid) {
      return;
    }

    setStep((current) => Math.min(2, current + 1));
  }

  async function handleSubmit(values: RequestFormValues) {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        requestId?: string;
        publicCode?: string;
        confirmationLink?: string;
        claimLink?: string;
        error?: string;
      };

      if (!response.ok || !payload.requestId) {
        throw new Error(payload.error ?? "Dopyt sa nepodarilo odoslať.");
      }

      window.localStorage.removeItem(draftStorageKey);

      const search = new URLSearchParams({
        requestId: payload.requestId,
        publicCode: payload.publicCode ?? "",
      });

      if (payload.confirmationLink) {
        search.set("confirm", payload.confirmationLink);
      }

      if (payload.claimLink) {
        search.set("claim", payload.claimLink);
      }

      router.push(`/dakujeme?${search.toString()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Dopyt sa nepodarilo odoslať.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">Dopyt krok za krokom</p>
          <h1 className="mt-2 text-3xl font-black text-[#1E1F48]">Zadanie dopytu do 3 krokov</h1>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-2.5 w-16 rounded-full ${index <= step ? "bg-[#2E5ACF]" : "bg-[#DDE1F7]"}`}
            />
          ))}
        </div>
      </div>

      <form
        className="space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <input type="hidden" {...form.register("antiSpamHoney")} />
        <input type="hidden" {...form.register("startedAt", { valueAsNumber: true })} />
        {step === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="categoryId">Kategória</Label>
              <select
                id="categoryId"
                className="flex h-12 w-full rounded-xl border border-[#C9CEE9] bg-white px-4 text-sm outline-none focus:border-[#2E5ACF]"
                {...form.register("categoryId")}
              >
                <option value="">Vyberte kategóriu</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#1E1F48]/60">{selectedCategory?.shortDescription}</p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="title">Názov dopytu</Label>
              <Input id="title" placeholder="Napr. Vymaľovanie 3-izbového bytu" {...form.register("title")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Detailný popis</Label>
              <Textarea
                id="description"
                rows={7}
                placeholder="Čo presne potrebujete, v akom stave je priestor, aké sú obmedzenia a termín?"
                {...form.register("description")}
              />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="postalCode">PSČ</Label>
              <Input id="postalCode" placeholder="821 05" {...form.register("postalCode")} />
            </div>
            <div>
              <Label htmlFor="locationLabel">Mesto / lokalita</Label>
              <Input id="locationLabel" placeholder="Bratislava, Ružinov" {...form.register("locationLabel")} />
            </div>
            <div>
              <Label htmlFor="urgency">Urgentnosť</Label>
              <select
                id="urgency"
                className="flex h-12 w-full rounded-xl border border-[#C9CEE9] bg-white px-4 text-sm outline-none focus:border-[#2E5ACF]"
                {...form.register("urgency")}
              >
                <option value="normal">Bežný termín</option>
                <option value="fast">Rýchlo</option>
                <option value="urgent">Urgentne</option>
              </select>
            </div>
            <div>
              <Label htmlFor="deadlineLabel">Požadovaný termín</Label>
              <Input id="deadlineLabel" placeholder="Ideálne do 2 týždňov" {...form.register("deadlineLabel")} />
            </div>
            {selectedCategory?.requestFields.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : undefined}>
                <Label htmlFor={`dynamic-${field.id}`}>{field.label}</Label>
                {field.type === "select" ? (
                  <select
                    id={`dynamic-${field.id}`}
                    className="flex h-12 w-full rounded-xl border border-[#C9CEE9] bg-white px-4 text-sm outline-none focus:border-[#2E5ACF]"
                    onChange={(event) => form.setValue(`dynamicValues.${field.id}`, event.target.value)}
                    defaultValue={String(form.getValues(`dynamicValues.${field.id}`) ?? "")}
                  >
                    <option value="">Vyberte možnosť</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={`dynamic-${field.id}`}
                    rows={5}
                    onChange={(event) => form.setValue(`dynamicValues.${field.id}`, event.target.value)}
                    defaultValue={String(form.getValues(`dynamicValues.${field.id}`) ?? "")}
                  />
                ) : (
                  <Input
                    id={`dynamic-${field.id}`}
                    type={field.type === "number" ? "number" : "text"}
                    onChange={(event) =>
                      form.setValue(
                        `dynamicValues.${field.id}`,
                        field.type === "number" ? Number(event.target.value) : event.target.value,
                      )
                    }
                    defaultValue={String(form.getValues(`dynamicValues.${field.id}`) ?? "")}
                  />
                )}
                {field.helpText ? <p className="mt-2 text-xs text-[#1E1F48]/60">{field.helpText}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="contactName">Meno a priezvisko</Label>
              <Input id="contactName" placeholder="Lucia Mrázová" {...form.register("contactName")} />
            </div>
            <div>
              <Label htmlFor="contactEmail">E-mail</Label>
              <Input id="contactEmail" type="email" placeholder="lucia@example.sk" {...form.register("contactEmail")} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Telefón</Label>
              <Input id="contactPhone" placeholder="+421 900 000 000" {...form.register("contactPhone")} />
            </div>
            <div>
              <Label htmlFor="preferredChannel">Preferovaný kanál</Label>
              <select
                id="preferredChannel"
                className="flex h-12 w-full rounded-xl border border-[#C9CEE9] bg-white px-4 text-sm outline-none focus:border-[#2E5ACF]"
                {...form.register("preferredChannel")}
              >
                <option value="email">E-mail</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="photos">Fotky projektu</Label>
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={async (event) => {
                  await uploadFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {form.watch("photos").map((photo) => (
                  <span
                    key={photo.path}
                    className="rounded-full bg-[#EEF0FD] px-3 py-1 text-xs font-semibold text-[#1E1F48]"
                  >
                    {photo.altText ?? photo.path.split("/").pop()}
                  </span>
                ))}
              </div>
            </div>
            <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-[#D6DBF1] bg-[#F8F9FE] p-4 text-sm text-[#1E1F48]/80">
              <input
                type="checkbox"
                checked={form.watch("termsAccepted")}
                onChange={(event) => form.setValue("termsAccepted", event.target.checked)}
                className="mt-1 size-4 rounded border-[#C9CEE9]"
              />
              Súhlasím s obchodnými podmienkami, spracovaním údajov a kontaktovaním kvôli vybaveniu dopytu.
            </label>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0 || submitting}
          >
            Späť
          </Button>
          <div className="flex gap-3">
            {step < 2 ? (
              <Button
                type="button"
                onClick={() => void handleNextStep()}
              >
                Pokračovať
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Odosielam dopyt..." : "Odoslať dopyt"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
