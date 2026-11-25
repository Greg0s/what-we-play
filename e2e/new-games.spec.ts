import { test, expect, type Page } from "@playwright/test";
import { freshIds, latestIds } from "../src/fresh";
import { games, gamesForPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";
import { VISIT_KEY } from "../src/useLastVisit";

const cards = (page: Page) => page.locator(".grid .game");
const newOption = (page: Page) => page.locator(".options .opt", { hasText: en.catalogue.fresh });
const news = (page: Page) => page.locator(".tv-news");

/** Pretends the previous visit began at `last` (it was more than a few hours ago). */
async function returningVisitor(page: Page, last: number) {
  await page.addInitScript(
    ({ key, last }) => window.localStorage.setItem(key, JSON.stringify({ since: null, last })),
    { key: VISIT_KEY, last },
  );
}

/** The day before the newest game was added: everything added that day (and later) is new since. */
const newest = games.reduce((latest, game) => (game.added > latest ? game.added : latest), games[0].added);
const beforeNewest = Date.parse(newest) - 24 * 60 * 60 * 1000;

/** A player count where something arrived since `beforeNewest`. */
const players = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((count) =>
  gamesForPlayerCount(count).some((game) => game.added === newest),
)!;
const path = players === 1 ? "/games-for-1-player/" : `/games-for-${players}-players/`;

test.describe("New games", () => {
  test("the latest games wear « New » for everyone, straight from the prerender", async ({ page }) => {
    await page.goto(path);

    const expected = gamesForPlayerCount(players).filter((game) => latestIds.has(game.id));
    await expect(page.locator(".grid .game__tag.is-new")).toHaveCount(expected.length);
    for (const game of expected) {
      const card = page.locator(".grid .game", { has: page.getByRole("heading", { name: game.name, level: 3, exact: true }) });
      await expect(card.locator(".is-new")).toHaveText(en.catalogue.tagNew);
    }
  });

  test("the « New » option lists only the new games, newest first", async ({ page }) => {
    await page.goto(path);

    const expected = gamesForPlayerCount(players)
      .filter((game) => latestIds.has(game.id))
      .sort((a, b) => b.added.localeCompare(a.added));
    await expect(newOption(page)).toContainText(String(expected.length));
    await newOption(page).click();
    await expect(newOption(page)).toHaveAttribute("aria-pressed", "true");

    await expect(cards(page)).toHaveCount(expected.length);
    await expect(cards(page).first().locator("h3")).toHaveText(expected[0].name);
  });

  test("a first visit hears no announcement", async ({ page }) => {
    await page.goto(path);
    await expect(cards(page).first()).toBeVisible();
    await expect(news(page)).toHaveCount(0);
  });

  test("a returning visitor: the TV announces what arrived, and « See » lists the new games", async ({ page }) => {
    await returningVisitor(page, beforeNewest);
    await page.goto(path);

    const expected = gamesForPlayerCount(players).filter((game) => freshIds(beforeNewest).has(game.id));
    await expect(news(page)).toContainText(en.news.line(expected.length));

    await page.getByRole("button", { name: en.news.show }).click();
    await expect(newOption(page)).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(expected.length);
    await expect(news(page)).toHaveCount(0);
  });

  test("on a phone the announcement is a strip under the banner", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await returningVisitor(page, beforeNewest);
    await page.goto(path);

    const strip = page.locator(".news-strip");
    await expect(strip).toBeVisible();
    await strip.getByRole("button", { name: en.news.show }).click();

    const expected = gamesForPlayerCount(players).filter((game) => freshIds(beforeNewest).has(game.id));
    await expect(cards(page)).toHaveCount(expected.length);
    await expect(strip).toHaveCount(0);
  });
});
