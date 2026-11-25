import { test, expect, type Locator } from "@playwright/test";
import { DEFAULT_PLAYERS, gameLink, gamesForPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";

/**
 * A card's link: the card itself, or, on a « Coup de cœur » with a note (whose
 * TV is a button, which a link can't hold), its title's link.
 */
const cardLink = (card: Locator) => card.and(card.page().locator("a.game")).or(card.locator("a.game__link"));

test.describe("Game catalogue", () => {
  test("shows the games for the default player count on load", async ({ page }) => {
    const expected = gamesForPlayerCount(DEFAULT_PLAYERS);

    await page.goto("/");

    await expect(page.locator(".grid .game")).toHaveCount(expected.length);
    for (const game of expected) {
      await expect(page.getByRole("heading", { name: game.name, level: 3 })).toBeVisible();
    }

    await expect(page.getByRole("heading", { level: 2, name: en.catalogue.resultCount(expected.length) })).toBeVisible();
    await expect(page.locator(".empty")).toHaveCount(0);
  });

  test("each card links out to the game and shows its genre and player range", async ({ page }) => {
    await page.goto("/");

    const first = page.locator(".grid .game").first();
    const link = cardLink(first);
    await expect(link).toHaveAttribute("href", /^https?:\/\//);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener");
    await expect(first.locator(".game__genre")).toBeVisible();
    await expect(first.locator(".game__range")).toBeVisible();
  });

  test("links to the game's own page in the site's language when it has one", async ({ page }) => {
    await page.goto("/fr/");

    // Games without a French page keep their default link.
    for (const game of gamesForPlayerCount(DEFAULT_PLAYERS)) {
      const card = page.locator(".grid .game", {
        has: page.getByRole("heading", { name: game.name, level: 3, exact: true }),
      });
      await expect(cardLink(card)).toHaveAttribute("href", gameLink(game, "fr"));
    }
  });
});
