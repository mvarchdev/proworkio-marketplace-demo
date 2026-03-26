"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Card, Input, Label } from "@proworkio/ui";

import { writeDemoSession } from "@/lib/demo-session";
import { passwordResetSchema, signInSchema, signUpSchema } from "@/lib/forms";
import { featureFlags } from "@/lib/platform";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthMode = "sign-in" | "sign-up" | "password-reset";

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const claimToken = searchParams.get("claimToken");

  const form = useForm({
    resolver: zodResolver(
      mode === "sign-up" ? signUpSchema : mode === "sign-in" ? signInSchema : passwordResetSchema,
    ),
    defaultValues:
      mode === "sign-up"
        ? { fullName: "", email: "", password: "" }
        : mode === "sign-in"
          ? { email: "", password: "" }
          : { email: "" },
  });

  async function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    setMessage(null);

    if (!featureFlags.hasSupabasePublic) {
      writeDemoSession({
        role: "customer",
        email: String(values.email ?? "demo@proworkio.local"),
        fullName: "Demo používateľ",
      });
      router.push(claimToken ? `/prevziat-dopyt?token=${encodeURIComponent(claimToken)}` : "/dashboard");
      return;
    }

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase klient nie je dostupný.");
      return;
    }

    if (mode === "sign-up") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: String(values.email),
        password: String(values.password),
        options: {
          data: {
            full_name: String(values.fullName),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (claimToken && data.session) {
        router.push(`/prevziat-dopyt?token=${encodeURIComponent(claimToken)}`);
        return;
      }

      setMessage(
        claimToken
          ? "Účet bol vytvorený. Po potvrdení e-mailu sa prihláste a dopyt sa priradí v ďalšom kroku."
          : "Účet bol vytvorený. Skontrolujte e-mail kvôli potvrdeniu účtu.",
      );
      return;
    }

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(values.email),
        password: String(values.password),
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const next = claimToken
        ? `/prevziat-dopyt?token=${encodeURIComponent(claimToken)}`
        : (searchParams.get("next") ?? "/dashboard");
      router.push(next);
      router.refresh();
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(String(values.email), {
      redirectTo: `${window.location.origin}/obnova-hesla`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Na zadaný e-mail sme odoslali odkaz na obnovu hesla.");
  }

  return (
    <Card className="mx-auto max-w-xl space-y-6 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2E5ACF]">
          {mode === "sign-up" ? "Registrácia" : mode === "sign-in" ? "Prihlásenie" : "Obnova hesla"}
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#1E1F48]">
          {mode === "sign-up"
            ? "Vytvorte si zákaznícky účet"
            : mode === "sign-in"
              ? "Vitajte späť"
              : "Pošleme vám odkaz na obnovu"}
        </h1>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit((values) => handleSubmit(values as Record<string, unknown>))}>
        {mode === "sign-up" ? (
          <div>
            <Label htmlFor="fullName">Meno a priezvisko</Label>
            <Input id="fullName" {...form.register("fullName")} />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        {mode !== "password-reset" ? (
          <div>
            <Label htmlFor="password">Heslo</Label>
            <Input id="password" type="password" {...form.register("password")} />
          </div>
        ) : null}

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <Button type="submit" className="w-full">
          {mode === "sign-up"
            ? "Vytvoriť účet"
            : mode === "sign-in"
              ? "Prihlásiť sa"
              : "Odoslať odkaz"}
        </Button>
      </form>
    </Card>
  );
}
