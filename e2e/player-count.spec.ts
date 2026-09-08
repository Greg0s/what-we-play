import { test, expect } from "@playwright/test";
import { gamesForPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";

test.describe("Player count", () => {
  test("typing a new count updates the list and the URL", async ({ page }) => {
    await page.goto("/");

    const input = page.getByLabel(en.header.playerCount);
    await expect(input).toHaveValue("4");
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(4).length);

    await input.fill("2");
    await expect(page).toHaveURL(/\/games-for-2-players\/$/);
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(2).length);
  });

  test("the + and − buttons step the count and floor at 1", async ({ page }) => {
    await page.goto("/games-for-1-player/");

    const input = page.getByLabel(en.header.playerCount);
    await expect(input).toHaveValue("1");

    await page.getByRole("button", { name: en.header.removePlayer, exact: true }).click();
    await expect(input).toHaveValue("1");

    await page.getByRole("button", { name: en.header.addPlayer, exact: true }).click();
    await expect(input).toHaveValue("2");
    await expect(page).toHaveURL(/\/games-for-2-players\/$/);
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(2).length);
  });
});
