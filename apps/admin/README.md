# Proworkio Admin

Operačný panel pre Proworkio. Admin používa Next.js App Router, zdieľané UI prvky a server-side read model nad Supabase, takže na hostovanom prostredí číta reálne prevádzkové dáta. Ak chýba `SUPABASE_SERVICE_ROLE_KEY`, automaticky spadne do statického fallbacku pre lokálny vývoj.

## Spustenie

Z koreňa repozitára:

```bash
pnpm install
pnpm dev:admin
```

Admin beží štandardne na `http://localhost:3001`.

## Sekcie

- `/` - prevádzkový prehľad
- `/uzivatelia` - identity a prístupy
- `/firmy` - onboarding a moderácia providerov
- `/dopyty` - request pipeline
- `/zhody` - matching engine
- `/platby` - one-off platby a invoice sync
- `/predplatne` - VIP subscriptions
- `/recenzie` - moderácia recenzií
- `/blog` - CMS / editorial
- `/notifikacie` - delivery orchestration
- `/webhooky` - event ledger
- `/audit-logy` - immutable audit trail

## Implementačné poznámky

- Navigácia a layout sú v `src/components/admin-shell.tsx`.
- Resource metadata a fallback copy sú centralizované v `src/lib/admin-data.ts`.
- Live read model a mapovanie hostovaných Supabase dát sú v `src/lib/admin-live-data.ts`.
- Prezentačné formátovanie a status badge mapovania sú v `src/lib/admin-presenters.ts`.
