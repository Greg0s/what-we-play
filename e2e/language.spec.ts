import { test, expect } from "@playwright/test";
import { LANGUAGES, LANGUAGE_NAMES, STORAGE_KEY } from "../src/i18n/config";
import { PLAYER_COUNT_PAGES, buildPath } from "../src/routes";
import { en } from "../src/i18n/locales/en";
import { fr } from "../src/i18n/locales/fr";

test.describe("Language switcher", () => {
  test("switches the UI language and updates the URL", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.header.question(4).join(" "));
    await expect(page.getByPlaceholder(en.catalogue.searchPlaceholder)).toBeVisible();

    await page.getByRole("button", { name: en.language.label }).click();
    await page.getByRole("option", { name: LANGUAGE_NAMES.fr }).click();

    await expect(page).toHaveURL(/\/fr\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fr.header.question(4).join(" "));
    await expect(page.getByPlaceholder(fr.catalogue.searchPlaceholder)).toBeVisible();

    // A language-prefixed URL states the language outright, so it survives a
    // reload rather than falling back to a detected preference.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fr.header.question(4).join(" "));
  });

  test("an unprefixed page loads the visitor's language as a page of its own", async ({ browser }) => {
    // A real navigation, not a swap after hydration: Chrome reads the page's
    // language as it loads, and offered to translate "from English" a page it
    // was showing in French.
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    const englishPath = buildPath({ language: "en", players: 4, isHome: false });
    const frenchPath = buildPath({ language: "fr", players: 4, isHome: false });

    await page.goto(englishPath);
    await expect(page).toHaveURL(new RegExp(`${frenchPath}$`));
    // The French file itself was loaded, not the English one rewritten.
    const loaded = await page.evaluate(
      () => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).name,
    );
    expect(loaded).toMatch(new RegExp(`${frenchPath}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fr.header.question(4).join(" "));

    // An explicit choice of English is kept: no redirect.
    await page.evaluate((key) => localStorage.setItem(key, "en"), STORAGE_KEY);
    await page.goto(englishPath);
    await expect(page).toHaveURL(new RegExp(`${englishPath}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("offers all three languages, with the current one marked selected", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: en.language.label }).click();

    const listbox = page.getByRole("listbox", { name: en.language.label });
    for (const name of Object.values(LANGUAGE_NAMES)) {
      await expect(listbox.getByRole("option", { name })).toBeVisible();
    }

    await expect(listbox.getByRole("option", { name: LANGUAGE_NAMES.en })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("the H1 holds on two lines above the keypad, in every language and at every count", async ({ page }) => {
    test.setTimeout(60000);
    for (const language of LANGUAGES) {
      for (const players of PLAYER_COUNT_PAGES) {
        await page.goto(buildPath({ language, players, isHome: false }));
        await page.evaluate(() => document.fonts.ready);
        const bubble = await page.locator(".bubble").boundingBox();
        const keypad = await page.locator(".deck").boundingBox();
        expect(bubble!.y + bubble!.height, `${language}, ${players} players`).toBeLessThan(keypad!.y);
      }
    }
  });
});
