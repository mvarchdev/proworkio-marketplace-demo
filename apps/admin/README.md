# Proworkio Admin

Operačný panel pre Proworkio. Táto baseline verzia používa Next.js App Router, Refine core, zdieľané UI prvky a demo dátový provider, aby bolo možné vyvíjať workflowy bez backend závislostí.

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

- Dáta v tejto baseline pochádzajú z demo provideru v `src/lib/demo-provider.ts`.
- Navigácia a layout sú v `src/components/admin-shell.tsx`.
- Resource konfigurácia a obsah sekcií sú centralizované v `src/lib/admin-data.ts`.
- Pri prechode na reálne API stačí nahradiť `demoDataProvider` za produkčný provider a ponechať shell aj stránky.
