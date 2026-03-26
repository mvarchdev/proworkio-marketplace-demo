import type { ReactNode } from "react";

export type ResourceKey =
  | "users"
  | "companies"
  | "requests"
  | "matches"
  | "payments"
  | "subscriptions"
  | "reviews"
  | "blog"
  | "notifications"
  | "webhooks"
  | "auditLogs";

export type Tone = "accent" | "muted" | "dark";

export interface BadgeCell {
  label: string;
  tone?: Tone;
}

export type CellValue = string | number | BadgeCell;

export interface ResourceRow {
  id: string;
  [key: string]: CellValue;
}

export interface ResourceColumn {
  key: string;
  label: string;
  className?: string;
}

export interface ResourceSignal {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}

export interface ResourceAction {
  label: string;
  href: string;
  variant?: "primary" | "outline" | "accent";
}

export interface ResourceConfig {
  key: ResourceKey;
  title: string;
  description: string;
  path: string;
  eyebrow: string;
  primaryAction: ResourceAction;
  signals: ResourceSignal[];
  notes: Array<{ title: string; body: string }>;
  columns: ResourceColumn[];
  rows: ResourceRow[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}

export interface DashboardQueueItem {
  title: string;
  note: string;
  tone: Tone;
}

export interface DashboardFeedItem {
  title: string;
  detail: string;
  time: string;
  tone: Tone;
}

export function badge(label: string, tone: Tone = "muted"): BadgeCell {
  return { label, tone };
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Aktívne dopyty",
    value: "38",
    note: "7 potvrdených dnes",
    tone: "accent",
  },
  {
    label: "Firemné schválenia",
    value: "12",
    note: "3 čakajú na ručný review",
    tone: "muted",
  },
  {
    label: "Neúspešné notifikácie",
    value: "5",
    note: "Fallback prešiel na SMS",
    tone: "dark",
  },
  {
    label: "Webhook chyby",
    value: "2",
    note: "obidva retry-safe",
    tone: "muted",
  },
];

export const dashboardQueues: DashboardQueueItem[] = [
  {
    title: "Moderácia firemných profilov",
    note: "12 nových žiadostí čaká na schválenie a doplnenie údajov.",
    tone: "accent",
  },
  {
    title: "Kontakt unlocky",
    note: "4 platby sú pripravené na webhook potvrdenie a audit zápis.",
    tone: "dark",
  },
  {
    title: "Odchyt notifikačných fallbackov",
    note: "3 správy prepnuté z e-mailu na SMS kvôli nedoručeniu.",
    tone: "muted",
  },
];

export const dashboardFeed: DashboardFeedItem[] = [
  {
    title: "Nový dopyt potvrdený",
    detail: "Kategória elektroinštalácie, automaticky spárované 4 firmy.",
    time: "pred 8 min",
    tone: "accent",
  },
  {
    title: "VIP predplatné obnovené",
    detail: "Firma Briseno Group prešla na mesačný plán bez výpadku.",
    time: "pred 21 min",
    tone: "muted",
  },
  {
    title: "Webhook Stripe spracovaný",
    detail: "Idempotentný event uložený do ledgeru bez duplicitného účtu.",
    time: "pred 38 min",
    tone: "dark",
  },
  {
    title: "Recenzia čaká na moderáciu",
    detail: "Hodnotenie 92/100 držíme mimo public profilu, kým sa neschváli.",
    time: "pred 1 h",
    tone: "muted",
  },
];

export const resourceConfigs: Record<ResourceKey, ResourceConfig> = {
  users: {
    key: "users",
    title: "Užívatelia",
    description: "Prehľad zákazníckych a firemných účtov, prístupov a poslednej aktivity.",
    path: "/uzivatelia",
    eyebrow: "Identity & access",
    primaryAction: { label: "Nový účet", href: "/uzivatelia", variant: "accent" },
    signals: [
      { label: "Aktívni zákazníci", value: "24", note: "8 s otvoreným dopytom", tone: "accent" },
      { label: "Firemné účty", value: "18", note: "12 schválených", tone: "muted" },
      { label: "Reset hesla", value: "3", note: "pending posledných 24h", tone: "dark" },
    ],
    notes: [
      { title: "Pravidlo", body: "Duplikáty účtov blokujeme podľa e-mailu, telefónu a claim tokenov." },
      { title: "Audit", body: "Citlivé akcie sa zapisujú do nemodifikovateľného audit logu." },
    ],
    columns: [
      { key: "name", label: "Používateľ" },
      { key: "role", label: "Rola" },
      { key: "status", label: "Stav" },
      { key: "lastActive", label: "Aktivita" },
      { key: "risk", label: "Riziko" },
    ],
    rows: [
      { id: "usr_001", name: "Mária Kováčová", role: "customer", status: badge("Aktívny", "accent"), lastActive: "pred 12 min", risk: "nízke" },
      { id: "usr_002", name: "Andrej Horváth", role: "provider", status: badge("Čaká na overenie", "muted"), lastActive: "pred 1 h", risk: "stredné" },
      { id: "usr_003", name: "Briseno Group Admin", role: "admin", status: badge("Admin", "dark"), lastActive: "pred 4 min", risk: "nízke" },
      { id: "usr_004", name: "Tomáš Benka", role: "customer", status: badge("Reset hesla", "muted"), lastActive: "pred 3 h", risk: "nízke" },
    ],
  },
  companies: {
    key: "companies",
    title: "Firmy",
    description: "Onboarding, schvaľovanie, profilová kompletnosť a VIP pripravenosť.",
    path: "/firmy",
    eyebrow: "Provider operations",
    primaryAction: { label: "Schváliť profil", href: "/firmy", variant: "primary" },
    signals: [
      { label: "Čakajúce schválenie", value: "12", note: "4 majú chýbajúce údaje", tone: "accent" },
      { label: "VIP aktívne", value: "9", note: "3 končia do 7 dní", tone: "muted" },
      { label: "Kompletnosť profilov", value: "84%", note: "rast +6 bodov", tone: "dark" },
    ],
    notes: [
      { title: "Moderácia", body: "Spustenie do matchingu až po schválení a kompletnej fakturácii." },
      { title: "Kvalita", body: "Povinné sú oblasti, radius, billing údaje a verejný popis." },
    ],
    columns: [
      { key: "name", label: "Firma" },
      { key: "approval", label: "Schválenie" },
      { key: "plan", label: "Plán" },
      { key: "coverage", label: "Zóna" },
      { key: "quality", label: "Kompletnosť" },
    ],
    rows: [
      { id: "cmp_001", name: "Briseno Group", approval: badge("Schválená", "accent"), plan: badge("VIP", "accent"), coverage: "Bratislava 35 km", quality: "92%" },
      { id: "cmp_002", name: "KovMax Servis", approval: badge("Čaká", "muted"), plan: badge("Basic", "muted"), coverage: "Trnava 20 km", quality: "64%" },
      { id: "cmp_003", name: "Nord Build", approval: badge("Pozastavená", "dark"), plan: badge("VIP", "accent"), coverage: "Košice 50 km", quality: "88%" },
      { id: "cmp_004", name: "ElektroFlow", approval: badge("Schválená", "accent"), plan: badge("Pro", "muted"), coverage: "Žilina 30 km", quality: "77%" },
    ],
  },
  requests: {
    key: "requests",
    title: "Dopyty",
    description: "Životný cyklus požiadaviek, fotografie, kontakty a stav potvrdenia.",
    path: "/dopyty",
    eyebrow: "Request pipeline",
    primaryAction: { label: "Nový dopyt", href: "/dopyty", variant: "accent" },
    signals: [
      { label: "Čaká na potvrdenie", value: "6", note: "drafty sú v bezpečí", tone: "accent" },
      { label: "Aktívne", value: "21", note: "matchnuté s firmami", tone: "muted" },
      { label: "Expirované", value: "4", note: "po 30 dňoch bez reakcie", tone: "dark" },
    ],
    notes: [
      { title: "Matching", body: "Automatické párovanie podľa kategórie, podkategórií a vzdialenosti." },
      { title: "Unlock", body: "Kontakt sa odomyká až po úspešnej platbe a webhook potvrdení." },
    ],
    columns: [
      { key: "title", label: "Dopyt" },
      { key: "category", label: "Kategória" },
      { key: "state", label: "Stav" },
      { key: "unlock", label: "Unlock" },
      { key: "age", label: "Vek" },
    ],
    rows: [
      { id: "req_001", title: "Rekonštrukcia kúpeľne", category: "Rekonštrukcia", state: badge("Aktívny", "accent"), unlock: badge("Neodomknutý", "muted"), age: "2 dni" },
      { id: "req_002", title: "Montáž fotovoltiky", category: "Energetika", state: badge("Čaká na potvrdenie", "muted"), unlock: badge("Draft", "muted"), age: "3 hod" },
      { id: "req_003", title: "Výmena rozvodov", category: "Elektrina", state: badge("Aktívny", "accent"), unlock: badge("Odomknutý", "accent"), age: "7 dní" },
      { id: "req_004", title: "Zateplenie fasády", category: "Stavba", state: badge("Expirovaný", "dark"), unlock: badge("Bez platby", "dark"), age: "31 dní" },
    ],
  },
  matches: {
    key: "matches",
    title: "Zhody",
    description: "Deterministické a auditovateľné odporúčania medzi dopytmi a firmami.",
    path: "/zhody",
    eyebrow: "Matching engine",
    primaryAction: { label: "Prepočítať match", href: "/zhody", variant: "primary" },
    signals: [
      { label: "Otvorené zhody", value: "48", note: "bez ručného zásahu", tone: "accent" },
      { label: "Priemerné skóre", value: "87/100", note: "stabilné naprieč kategóriami", tone: "muted" },
      { label: "Auditované", value: "100%", note: "všetky zápisy v logu", tone: "dark" },
    ],
    notes: [
      { title: "Pravidlá", body: "Skóre vychádza z kategórie, vzdialenosti, subkategórie a dostupnosti." },
      { title: "Viditeľnosť", body: "Kontakt zostáva skrytý, kým nie je splnené odomknutie." },
    ],
    columns: [
      { key: "request", label: "Dopyt" },
      { key: "company", label: "Firma" },
      { key: "score", label: "Skóre" },
      { key: "reason", label: "Dôvod" },
      { key: "visibility", label: "Viditeľnosť" },
    ],
    rows: [
      { id: "mtc_001", request: "Rekonštrukcia kúpeľne", company: "KovMax Servis", score: "94", reason: "kategória + vzdialenosť", visibility: badge("Skryté", "muted") },
      { id: "mtc_002", request: "Montáž fotovoltiky", company: "ElektroFlow", score: "91", reason: "subkategória + radius", visibility: badge("Skryté", "muted") },
      { id: "mtc_003", request: "Výmena rozvodov", company: "Briseno Group", score: "88", reason: "kategória + VIP profil", visibility: badge("Zobrazené", "accent") },
      { id: "mtc_004", request: "Zateplenie fasády", company: "Nord Build", score: "83", reason: "pokrytie zóny", visibility: badge("Skryté", "muted") },
    ],
  },
  payments: {
    key: "payments",
    title: "Platby",
    description: "Unlocky kontaktov, VIP fakturácia, potvrdenia a synchronizácia dokladov.",
    path: "/platby",
    eyebrow: "Billing ledger",
    primaryAction: { label: "Otvoriť Stripe", href: "/platby", variant: "accent" },
    signals: [
      { label: "Úspešné", value: "29", note: "6 čaká na invoice sync", tone: "accent" },
      { label: "Zamietnuté", value: "2", note: "retry bez duplicity", tone: "dark" },
      { label: "Čaká webhook", value: "4", note: "idempotentné spracovanie", tone: "muted" },
    ],
    notes: [
      { title: "On-line istota", body: "Redirect nikdy nie je zdroj pravdy. Rozhoduje webhook a ledger." },
      { title: "Doklady", body: "Úspešné platby sa synchronizujú do fakturačného systému." },
    ],
    columns: [
      { key: "reference", label: "Referencia" },
      { key: "type", label: "Typ" },
      { key: "amount", label: "Suma" },
      { key: "status", label: "Stav" },
      { key: "invoice", label: "Doklad" },
    ],
    rows: [
      { id: "pay_001", reference: "pi_91A2", type: "Kontakt unlock", amount: "15 €", status: badge("Potvrdené", "accent"), invoice: badge("Synced", "accent") },
      { id: "pay_002", reference: "sub_1122", type: "VIP monthly", amount: "89 €", status: badge("Pending", "muted"), invoice: badge("Čaká", "muted") },
      { id: "pay_003", reference: "pi_77F3", type: "Kontakt unlock", amount: "15 €", status: badge("Zlyhalo", "dark"), invoice: badge("Bez syncu", "dark") },
      { id: "pay_004", reference: "sub_8891", type: "VIP monthly", amount: "129 €", status: badge("Potvrdené", "accent"), invoice: badge("Synced", "accent") },
    ],
  },
  subscriptions: {
    key: "subscriptions",
    title: "Predplatné",
    description: "VIP status, obnovenia, portal action a downgrade scenáre.",
    path: "/predplatne",
    eyebrow: "Subscriptions",
    primaryAction: { label: "Otvoriť portal", href: "/predplatne", variant: "primary" },
    signals: [
      { label: "VIP aktívne", value: "9", note: "2 končia do 7 dní", tone: "accent" },
      { label: "Neúspešné platby", value: "1", note: "dunning beží", tone: "dark" },
      { label: "Portal requests", value: "4", note: "samostatne auditované", tone: "muted" },
    ],
    notes: [
      { title: "Životný cyklus", body: "Obnovenie, zlyhanie aj expiry sú explicitné stavy." },
      { title: "Upsell", body: "VIP odomyká galériu, detail profilu a zvýraznenie v matchoch." },
    ],
    columns: [
      { key: "company", label: "Firma" },
      { key: "plan", label: "Plán" },
      { key: "renewal", label: "Obnova" },
      { key: "status", label: "Stav" },
      { key: "portal", label: "Portal" },
    ],
    rows: [
      { id: "sub_001", company: "Briseno Group", plan: badge("VIP", "accent"), renewal: "12.04.2026", status: badge("Aktívne", "accent"), portal: badge("Dostupný", "muted") },
      { id: "sub_002", company: "ElektroFlow", plan: badge("VIP", "accent"), renewal: "31.03.2026", status: badge("Varovanie", "muted"), portal: badge("Čaká", "muted") },
      { id: "sub_003", company: "KovMax Servis", plan: badge("Pro", "muted"), renewal: "N/A", status: badge("Free", "dark"), portal: badge("Nedostupný", "dark") },
      { id: "sub_004", company: "Nord Build", plan: badge("VIP", "accent"), renewal: "29.03.2026", status: badge("Past due", "dark"), portal: badge("Dostupný", "muted") },
    ],
  },
  reviews: {
    key: "reviews",
    title: "Recenzie",
    description: "Skóre 0-100, moderácia a anti-abuse dohľad nad dôveryhodnosťou firiem.",
    path: "/recenzie",
    eyebrow: "Trust layer",
    primaryAction: { label: "Moderovať", href: "/recenzie", variant: "accent" },
    signals: [
      { label: "Na review", value: "4", note: "1 podozrivý payload", tone: "accent" },
      { label: "Schválené", value: "26", note: "zobrazené na profiloch", tone: "muted" },
      { label: "Zamietnuté", value: "2", note: "duplicate abuse", tone: "dark" },
    ],
    notes: [
      { title: "Prístup", body: "Recenziu vidíme verejne až po moderácii a po reálnom interakčnom path." },
      { title: "Formát", body: "Rating držíme v 0-100 škále kvôli jednotnej produktovej metrike." },
    ],
    columns: [
      { key: "author", label: "Autor" },
      { key: "company", label: "Firma" },
      { key: "score", label: "Skóre" },
      { key: "status", label: "Moderácia" },
      { key: "evidence", label: "Dôkaz" },
    ],
    rows: [
      { id: "rev_001", author: "Mária K.", company: "Briseno Group", score: "96", status: badge("Schválené", "accent"), evidence: "dopyt + platba" },
      { id: "rev_002", author: "Tomáš B.", company: "KovMax Servis", score: "72", status: badge("Na kontrolu", "muted"), evidence: "match len" },
      { id: "rev_003", author: "Peter S.", company: "Nord Build", score: "41", status: badge("Zamietnuté", "dark"), evidence: "duplicitný účet" },
      { id: "rev_004", author: "Jana R.", company: "ElektroFlow", score: "88", status: badge("Schválené", "accent"), evidence: "overený unlock" },
    ],
  },
  blog: {
    key: "blog",
    title: "Blog & CMS",
    description: "Redakčný prehľad, SEO stav, perexy a plánovanie publikácie.",
    path: "/blog",
    eyebrow: "Editorial",
    primaryAction: { label: "Nový článok", href: "/blog", variant: "primary" },
    signals: [
      { label: "Koncepty", value: "3", note: "2 pripravené na publish", tone: "accent" },
      { label: "Publikované", value: "18", note: "SEO meta vyplnené", tone: "muted" },
      { label: "Video embed", value: "5", note: "skontrolovať responsivitu", tone: "dark" },
    ],
    notes: [
      { title: "Obsahová stratégia", body: "Kategórie blogu zrkadlia hlavné produktové kategórie a dopyty." },
      { title: "SEO", body: "Každý článok má slug, perex, cover a structured metadata." },
    ],
    columns: [
      { key: "title", label: "Článok" },
      { key: "category", label: "Kategória" },
      { key: "seo", label: "SEO" },
      { key: "status", label: "Stav" },
      { key: "publish", label: "Publikácia" },
    ],
    rows: [
      { id: "blog_001", title: "Ako vybrať firmu na rekonštrukciu kúpeľne", category: "Rekonštrukcia", seo: badge("92/100", "accent"), status: badge("Publikované", "accent"), publish: "17.03.2026" },
      { id: "blog_002", title: "Kedy sa oplatí VIP profil pre firmy", category: "Biznis", seo: badge("87/100", "muted"), status: badge("Draft", "muted"), publish: "—" },
      { id: "blog_003", title: "Ako funguje matchovanie dopytov", category: "Produkt", seo: badge("89/100", "accent"), status: badge("Plánované", "muted"), publish: "22.03.2026" },
      { id: "blog_004", title: "Kontrola kvality recenzií", category: "Trust", seo: badge("84/100", "muted"), status: badge("Publikované", "accent"), publish: "08.03.2026" },
    ],
  },
  notifications: {
    key: "notifications",
    title: "Notifikácie",
    description: "Orchestrácia kanálov, fallback logic a delivery attempts s dôvodmi zlyhania.",
    path: "/notifikacie",
    eyebrow: "Delivery orchestration",
    primaryAction: { label: "Prehľad fallbackov", href: "/notifikacie", variant: "accent" },
    signals: [
      { label: "Odoslané", value: "126", note: "všetky attempts logged", tone: "accent" },
      { label: "Fallbacky", value: "8", note: "email → SMS / WhatsApp", tone: "muted" },
      { label: "Nedoručené", value: "1", note: "čaká na retry window", tone: "dark" },
    ],
    notes: [
      { title: "Orchestrácia", body: "Každá správa má vlastný event a históriu pokusov po kanáloch." },
      { title: "Audit", body: "Provider response, reason a final outcome sú uložené pre operátorov." },
    ],
    columns: [
      { key: "event", label: "Udalosť" },
      { key: "primary", label: "Primárny kanál" },
      { key: "fallback", label: "Fallback" },
      { key: "result", label: "Výsledok" },
      { key: "age", label: "Vek" },
    ],
    rows: [
      { id: "ntf_001", event: "Potvrdenie dopytu", primary: "E-mail", fallback: "SMS", result: badge("Doručené", "accent"), age: "4 min" },
      { id: "ntf_002", event: "VIP renewal", primary: "E-mail", fallback: "WhatsApp", result: badge("Fallback", "muted"), age: "18 min" },
      { id: "ntf_003", event: "Moderácia recenzie", primary: "E-mail", fallback: "SMS", result: badge("Zlyhané", "dark"), age: "41 min" },
      { id: "ntf_004", event: "Unlock payment", primary: "E-mail", fallback: "SMS", result: badge("Doručené", "accent"), age: "52 min" },
    ],
  },
  webhooks: {
    key: "webhooks",
    title: "Webhooky",
    description: "Ledger externých eventov, retry politika a idempotentné zpracovanie integrácií.",
    path: "/webhooky",
    eyebrow: "Event ledger",
    primaryAction: { label: "Skontrolovať queue", href: "/webhooky", variant: "outline" },
    signals: [
      { label: "Spracované", value: "54", note: "bez duplicitných zápisov", tone: "accent" },
      { label: "Retry", value: "2", note: "backoff je aktívny", tone: "muted" },
      { label: "Zlyhané", value: "1", note: "incident otvorený", tone: "dark" },
    ],
    notes: [
      { title: "Bezpečnosť", body: "Raw event metadata sa uloží pred transformáciou a potom sa spracuje idempotentne." },
      { title: "Sledovanie", body: "Každý event má referenciu na final domain state a posledný retry pokus." },
    ],
    columns: [
      { key: "source", label: "Zdroj" },
      { key: "event", label: "Event" },
      { key: "idempotent", label: "Idempotentné" },
      { key: "status", label: "Stav" },
      { key: "attempts", label: "Pokusy" },
    ],
    rows: [
      { id: "wh_001", source: "Stripe", event: "checkout.session.completed", idempotent: badge("Áno", "accent"), status: badge("Spracované", "accent"), attempts: "1" },
      { id: "wh_002", source: "Resend", event: "email.delivered", idempotent: badge("Áno", "accent"), status: badge("Spracované", "accent"), attempts: "1" },
      { id: "wh_003", source: "Infobip", event: "message.failed", idempotent: badge("Áno", "accent"), status: badge("Retry", "muted"), attempts: "3" },
      { id: "wh_004", source: "Stripe", event: "invoice.payment_failed", idempotent: badge("Áno", "accent"), status: badge("Incident", "dark"), attempts: "2" },
    ],
  },
  auditLogs: {
    key: "auditLogs",
    title: "Audit logy",
    description: "Nemodifikovateľná stopa citlivých zmien, statusov a approvals.",
    path: "/audit-logy",
    eyebrow: "Immutable trail",
    primaryAction: { label: "Exportovať log", href: "/audit-logy", variant: "primary" },
    signals: [
      { label: "Záznamy", value: "1 284", note: "dnes +41 nových", tone: "accent" },
      { label: "Citlivé akcie", value: "83", note: "vždy viazané na actor", tone: "muted" },
      { label: "RLS overenie", value: "100%", note: "read-only surface", tone: "dark" },
    ],
    notes: [
      { title: "Princíp", body: "Audit je append-only a nikdy sa neupravuje priamo." },
      { title: "Opatrnosť", body: "Operátorské akcie ako schválenie, unlock či moderation sa zapisujú s kontextom." },
    ],
    columns: [
      { key: "action", label: "Akcia" },
      { key: "actor", label: "Actor" },
      { key: "resource", label: "Zdroj" },
      { key: "result", label: "Výsledok" },
      { key: "time", label: "Čas" },
    ],
    rows: [
      { id: "aud_001", action: "Schválenie firmy", actor: "admin:eva", resource: "Briseno Group", result: badge("OK", "accent"), time: "pred 11 min" },
      { id: "aud_002", action: "Unlock kontaktu", actor: "system", resource: "req_003", result: badge("OK", "accent"), time: "pred 19 min" },
      { id: "aud_003", action: "Zamietnutie recenzie", actor: "admin:jakub", resource: "rev_003", result: badge("OK", "accent"), time: "pred 44 min" },
      { id: "aud_004", action: "Zmena webhook stavu", actor: "system", resource: "wh_004", result: badge("Incident", "dark"), time: "pred 52 min" },
    ],
  },
};

export const resourceOrder: ResourceKey[] = [
  "users",
  "companies",
  "requests",
  "matches",
  "payments",
  "subscriptions",
  "reviews",
  "blog",
  "notifications",
  "webhooks",
  "auditLogs",
];

export const dashboardCopy = {
  title: "Prevádzkový panel",
  description:
    "Zjednotený dohľad nad dopytmi, firmami, platbami, notifikáciami a auditom bez preťaženia operátora.",
  badge: "Staging / demo",
};

export function getResourceConfig(key: ResourceKey): ResourceConfig {
  return resourceConfigs[key];
}

export function getResourcePath(key: ResourceKey): string {
  return resourceConfigs[key].path;
}

export function getResourceLabel(key: ResourceKey): string {
  return resourceConfigs[key].title;
}

export function getResourceSummary(key: ResourceKey): ReactNode {
  return resourceConfigs[key].signals[0]?.value ?? "";
}
