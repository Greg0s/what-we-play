import { test, expect } from "@playwright/test";
import { en } from "../src/i18n/locales/en";

test.describe("Search", () => {
  test("filters the catalogue by name, ignoring the current player count", async ({ page }) => {
    await page.goto("/"); // default player count is 4

    // UwUFUFU is a 1-player-only game, so it is not part of the 4-player list.
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 2 })).toHaveCount(0);

    const search = page.getByPlaceholder(en.catalogue.searchPlaceholder);
    await search.fill("uwufufu");

    await expect(page.locator(".grid .game")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 2 })).toBeVisible();
    await expect(page.getByText(en.catalogue.searchingWholeCatalogue)).toBeVisible();

    await page.getByRole("button", { name: en.catalogue.clearSearch }).click();
    await expect(search).toHaveValue("");
    await expect(page.getByRole("heading", { name: "UwUFUFU", level: 2 })).toHaveCount(0);
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    await page.goto("/");

    const search = page.getByPlaceholder(en.catalogue.searchPlaceholder);
    await search.fill("zzzznotagame");

    await expect(page.locator(".empty")).toBeVisible();
    await expect(page.getByText(en.catalogue.emptyTitle("zzzznotagame"))).toBeVisible();
    await expect(page.locator(".grid .game")).toHaveCount(0);
  });
});
