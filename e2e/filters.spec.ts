import { test, expect } from "@playwright/test";
import { games, matchesPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";

test.describe("Filters", () => {
  test("the solo filter narrows to solo games and switches to 1 player", async ({ page }) => {
    await page.goto("/"); // default player count is 4

    const soloChip = page.getByRole("button", { name: en.catalogue.tagSolo, exact: true });
    await soloChip.click();

    await expect(page.getByLabel(en.header.playerCount)).toHaveValue("1");
    await expect(page).toHaveURL(/\/games-for-1-player\/$/);

    const soloAtOne = games.filter((game) => game.solo && matchesPlayerCount(game, 1));
    await expect(page.locator(".grid .game")).toHaveCount(soloAtOne.length);

    // Turning it back off restores the player count that was active before.
    await soloChip.click();
    await expect(page.getByLabel(en.header.playerCount)).toHaveValue("4");
    await expect(page).toHaveURL(/\/games-for-4-players\/$/);
    await expect(page.locator(".grid .game")).toHaveCount(
      games.filter((game) => matchesPlayerCount(game, 4)).length,
    );
  });

  test("the no-account filter shows only games playable without signing up", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: en.catalogue.noAccountNeeded, exact: true })
      .click();

    const expected = games.filter(
      (game) => !game.accountNeeded && matchesPlayerCount(game, 4),
    );
    await expect(page.locator(".grid .game")).toHaveCount(expected.length);

    await page.getByRole("button", { name: en.catalogue.resetFilters }).click();
    await expect(page.locator(".grid .game")).toHaveCount(
      games.filter((game) => matchesPlayerCount(game, 4)).length,
    );
  });

  test("combining filters narrows further, and the active count is shown", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: en.catalogue.tagMultiplayer, exact: true }).click();
    await page
      .getByRole("button", { name: en.catalogue.mobileFriendly, exact: true })
      .click();

    const expected = games.filter(
      (game) => game.multiplayer && game.mobileFriendly && matchesPlayerCount(game, 4),
    );
    await expect(page.locator(".grid .game")).toHaveCount(expected.length);

    // Scoped by class rather than role name: "Reset filters" also matches the
    // accessible-name substring "filters" once it appears alongside it.
    await expect(page.locator(".filters-button")).toContainText("2");
  });
});
