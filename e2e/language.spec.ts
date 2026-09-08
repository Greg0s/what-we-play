import { test, expect } from "@playwright/test";
import { LANGUAGE_NAMES } from "../src/i18n/config";
import { en } from "../src/i18n/locales/en";
import { fr } from "../src/i18n/locales/fr";

test.describe("Language switcher", () => {
  test("switches the UI language and updates the URL", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.header.title);
    await expect(page.getByPlaceholder(en.catalogue.searchPlaceholder)).toBeVisible();

    await page.getByRole("button", { name: en.language.label }).click();
    await page.getByRole("option", { name: LANGUAGE_NAMES.fr }).click();

    await expect(page).toHaveURL(/\/fr\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fr.header.title);
    await expect(page.getByPlaceholder(fr.catalogue.searchPlaceholder)).toBeVisible();

    // A language-prefixed URL states the language outright, so it survives a
    // reload rather than falling back to a detected preference.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fr.header.title);
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
});
