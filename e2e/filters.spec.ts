import { test, expect, type Page } from "@playwright/test";
import { games, gamesForPlayerCount, matchesPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";

const cards = (page: Page) => page.locator(".grid .game");

test.describe("Options and genres", () => {
  test("the no-account option keeps only games playable without signing up", async ({ page }) => {
    await page.goto("/");

    const noAccount = page.getByRole("button", { name: en.catalogue.noAccountNeeded, exact: true });
    await noAccount.click();
    await expect(noAccount).toHaveAttribute("aria-pressed", "true");

    const expected = gamesForPlayerCount(4).filter((game) => !game.accountNeeded);
    await expect(cards(page)).toHaveCount(expected.length);

    await page.getByRole("button", { name: en.catalogue.resetFilters }).click();
    await expect(cards(page)).toHaveCount(gamesForPlayerCount(4).length);
  });

  test("combining options narrows further", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: en.catalogue.strangers, exact: true }).click();
    await page.getByRole("button", { name: en.catalogue.mobileFriendly, exact: true }).click();

    const expected = gamesForPlayerCount(4).filter((game) => game.soloWithStrangers && game.mobileFriendly);
    await expect(cards(page)).toHaveCount(expected.length);
  });

  test("screen share looks across the whole catalogue, whatever the player count", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: en.catalogue.screenShare, exact: true }).click();

    await expect(cards(page)).toHaveCount(games.filter((game) => game.screenShare).length);
    await expect(page.getByText(en.catalogue.scopeScreenShare)).toBeVisible();
  });

  test("a genre narrows the list, and « All » brings it back", async ({ page }) => {
    await page.goto("/");

    const music = page.locator(".genre", { hasText: en.genres.music.chip });
    await music.click();
    await expect(music).toHaveAttribute("aria-pressed", "true");

    const expected = games.filter((game) => game.genre === "music" && matchesPlayerCount(game, 4));
    await expect(cards(page)).toHaveCount(expected.length);
    for (const card of await cards(page).all()) {
      await expect(card.locator(".game__genre")).toHaveText(en.genres.music.band);
    }

    await page.locator(".genre", { hasText: en.catalogue.allGenres }).click();
    await expect(cards(page)).toHaveCount(gamesForPlayerCount(4).length);
  });
});
