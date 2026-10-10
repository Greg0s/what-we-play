import { test, expect } from "@playwright/test";
import { games } from "../src/games";
import { en } from "../src/i18n/locales/en";
import { fr } from "../src/i18n/locales/fr";

/** Names of the games whose keywords in `keywords` include `keyword`. */
function namesWithKeyword(keywords: Record<string, readonly string[]>, keyword: string) {
  return games.filter((game) => keywords[game.id]?.includes(keyword)).map((game) => game.name);
}

test.describe("Search", () => {
  test("filters the catalogue by name, ignoring the current player count", async ({ page }) => {
    await page.goto("/"); // default player count is 4

    // UwUFUFU is a 1-player-only game, so it is not part of the 4-player list.
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 3 })).toHaveCount(0);

    const search = page.getByPlaceholder(en.catalogue.searchPlaceholder);
    await search.fill("uwufufu");

    await expect(page.locator(".grid .game")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 3 })).toBeVisible();
    await expect(page.getByText(en.catalogue.scopeSearch("uwufufu"))).toBeVisible();

    await page.getByRole("button", { name: en.catalogue.clearSearch }).click();
    await expect(search).toHaveValue("");
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 3 })).toHaveCount(0);
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    await page.goto("/");

    const search = page.getByPlaceholder(en.catalogue.searchPlaceholder);
    await search.fill("zzzznotagame");

    await expect(page.locator(".empty")).toBeVisible();
    await expect(page.getByText(en.catalogue.emptyTitle("zzzznotagame"))).toBeVisible();
    await expect(page.locator(".grid .game")).toHaveCount(0);
  });

  test("finds games by a keyword that is in neither their name nor their description", async ({
    page,
  }) => {
    await page.goto("/");

    // "pictionary" is only a keyword: no name or description mentions it.
    const expected = namesWithKeyword(en.gameKeywords, "pictionary");
    expect(expected.length).toBeGreaterThan(0);

    await page.getByPlaceholder(en.catalogue.searchPlaceholder).fill("Pictionary");

    await expect(page.locator(".grid .game")).toHaveCount(expected.length);
    for (const name of expected) {
      await expect(page.getByRole("heading", { name, level: 3 })).toBeVisible();
    }
  });

  test("matches keywords of the current language, ignoring accents", async ({ page }) => {
    await page.goto("/fr/");

    // Typed without its accent, "cinema" still has to find the "cinéma" keyword.
    const expected = namesWithKeyword(fr.gameKeywords, "cinéma");
    expect(expected.length).toBeGreaterThan(0);

    await page.getByPlaceholder(fr.catalogue.searchPlaceholder).fill("cinema");

    for (const name of expected) {
      await expect(page.getByRole("heading", { name, level: 3 })).toBeVisible();
    }
  });
});
