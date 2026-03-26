export const currency = "eur";

export const leadUnlockPrice = {
  amountCents: 2900,
  currency,
  title: "Odomknutie kontaktu k dopytu",
  description: "Jednorazové zobrazenie kontaktných údajov zákazníka.",
} as const;

export const vipMonthlyPlan = {
  amountCents: 7900,
  currency,
  interval: "month",
  title: "Proworkio VIP",
  description: "Zvýraznený profil, galéria realizácií a priorita pri dôveryhodnosti.",
} as const;
