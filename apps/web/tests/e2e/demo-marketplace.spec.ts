import { expect, test } from "@playwright/test";

test.describe("Proworkio demo journeys", () => {
  test("visitor can submit, confirm, and claim a request in demo mode", async ({ page }) => {
    await page.goto("/zadat-dopyt");

    await expect(page.getByRole("heading", { name: "Zadanie dopytu do 3 krokov" })).toBeVisible();

    await page.getByLabel("Kategória").selectOption("maliarske-prace");
    await page.getByLabel("Názov dopytu").fill("Vymaľovanie bytu po sťahovaní");
    await page
      .getByLabel("Detailný popis")
      .fill("Potrebujem vymaľovať trojizbový byt po nájomníkovi a zabezpečiť čisté odovzdanie priestoru.");
    await page.getByRole("button", { name: "Pokračovať" }).click();

    await page.getByLabel("PSČ").fill("82105");
    await page.getByLabel("Mesto / lokalita").fill("Bratislava, Ružinov");
    await page.getByLabel("Požadovaný termín").fill("Do 10 dní");
    await page.getByLabel("Približná výmera").fill("84");
    await page.getByLabel("Stav podkladu").selectOption("mensie-opravy");
    await page.getByRole("button", { name: "Pokračovať" }).click();

    await page.getByLabel("Meno a priezvisko").fill("Lucia Mrázová");
    await page.getByLabel("E-mail").fill("lucia@example.sk");
    await page.getByLabel("Telefón").fill("+421904555111");
    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Odoslať dopyt" }).click();

    await expect(page).toHaveURL(/\/dakujeme\?/);
    await expect(page.getByRole("heading", { name: /je prijatý/i })).toBeVisible();

    await page.getByRole("link", { name: "potvrdiť dopyt" }).click();
    await expect(page.getByRole("heading", { name: "Dopyt je aktívny" })).toBeVisible();

    await page.goto("/prevziat-dopyt?token=demo-request-123");
    await expect(page.getByRole("heading", { name: "Priradenie guest dopytu k účtu" })).toBeVisible();

    await page.getByRole("button", { name: "Aktivovať demo účet a prevziať dopyt" }).click();
    await expect(page).toHaveURL(/\/dashboard\/dopyty/);
    await expect(page.getByRole("heading", { name: "Moje dopyty", level: 1 })).toBeVisible();
  });

  test("company can complete onboarding and land in the company dashboard in demo mode", async ({ page }) => {
    await page.goto("/registracia-firmy");

    await expect(page.getByRole("heading", { name: "Profil firmy pripravený na moderáciu" })).toBeVisible();

    await page.getByLabel("Verejný názov").fill("Test Maliari");
    await page.getByLabel("Právny názov").fill("Test Maliari s.r.o.");
    await page.getByLabel("Slug profilu").fill("test-maliari");
    await page.getByLabel("IČO").fill("12345678");
    await page
      .getByLabel("Krátky popis")
      .fill("Skúsený tím pre interiérové maľovanie, stierky a odovzdanie zákazky bez neporiadku.");
    await page
      .getByLabel("Dlhý popis")
      .fill("Realizujeme maľovanie bytov a domov, drobné opravy podkladov a koordináciu termínov tak, aby zákazník dostal jasný plán a čisté odovzdanie priestoru.");

    await page.getByText("Maliarske práce").click();
    await page.getByRole("button", { name: "Pokračovať" }).click();

    await page.getByLabel("Mesto").fill("Bratislava");
    await page.getByLabel("PSČ").fill("82105");
    await page.getByLabel("Adresa").fill("Prievozská 14");
    await page.getByLabel("Kontaktná osoba").fill("Juraj Kováč");
    await page.getByLabel("Verejný e-mail").fill("info@testmaliari.sk");
    await page.getByLabel("Fakturačný e-mail").fill("faktury@testmaliari.sk");
    await page.getByLabel("Telefón").fill("+421905111222");
    await page.getByLabel("Web").fill("https://testmaliari.sk");
    await page.getByLabel("Servisný rádius (m)").fill("30000");
    await page.getByLabel("Roky skúseností").fill("12");
    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Uložiť firemný profil" }).click();

    await expect(page).toHaveURL(/\/dashboard\/firma/);
    await expect(page.getByRole("heading", { name: "Firemný dashboard" })).toBeVisible();
    await expect(page.getByText("Lead unlock je účtovaný až po úspešnej platbe potvrdenej webhookom.")).toBeVisible();
  });
});
