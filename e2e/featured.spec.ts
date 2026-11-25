import { test, expect, type Page } from "@playwright/test";
import { featuredId } from "../src/featured";
import { games, gameLink, matchesPlayerCount } from "../src/games";
import { en, type Translation } from "../src/i18n/locales/en";
import { PLAYER_COUNT_PAGES, buildPath } from "../src/routes";

// The build draws the week's game from its own day: run the tests the week of the build.
const featured = games.find((game) => game.id === featuredId(new Date().toISOString().slice(0, 10)))!;
const note = (en as Translation).featuredNotes[featured.id as keyof Translation["featuredNotes"]];
const players = PLAYER_COUNT_PAGES.find((count) => matchesPlayerCount(featured, count))!;
const path = buildPath({ language: "en", players, isHome: false });

const card = (page: Page) => page.locator(".grid .game").first();
const tv = (page: Page) => card(page).locator(".game__tv");

test.describe("Coup de cœur", () => {
  test("the featured game leads the list, with its tag and the small TV", async ({ page }) => {
    await page.goto(path);
    await expect(card(page).locator("h3")).toHaveText(featured.name);
    await expect(card(page).locator(".game__tag.is-featured")).toHaveText(en.catalogue.tagFeatured);
    await expect(tv(page)).toBeVisible();
    await expect(page.locator(".grid .game__tv")).toHaveCount(1);
  });

  test("it is the same game on every page it fits, and nowhere else", async ({ page }) => {
    for (const count of [1, 4, 10]) {
      await page.goto(buildPath({ language: "en", players: count, isHome: false }));
      await expect(page.locator(".grid .game.is-featured")).toHaveCount(matchesPlayerCount(featured, count) ? 1 : 0);
    }
  });

  test("without a note, the TV opens the game like the rest of the card", async ({ page }) => {
    test.skip(Boolean(note), "the featured game has a note");
    await page.goto(path);
    await expect(tv(page).getByRole("button")).toHaveCount(0);

    await tv(page).scrollIntoViewIfNeeded();
    const box = (await tv(page).boundingBox())!;
    const href = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href"),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    expect(href).toBe(gameLink(featured, "en"));
  });

  test("with a note, the TV says it: on hover, and on click until a click elsewhere or Escape", async ({ page }) => {
    test.skip(!note, "the featured game has no note yet");
    await page.goto(path);
    const button = page.getByRole("button", { name: en.featured.readNote });
    const bubble = card(page).locator(".game__note");
    await expect(bubble).toBeHidden();

    await button.hover();
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText(note!);
    await expect(bubble).toContainText(en.featured.noteTitle);
    await page.mouse.move(0, 0);
    await expect(bubble).toBeHidden();

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(0, 0);
    await expect(bubble).toBeVisible();
    await page.locator(".count h2").click();
    await expect(bubble).toBeHidden();

    await button.click();
    await expect(bubble).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(bubble).toBeHidden();
    await expect(button).toBeFocused();

    // The title is still the way to the game.
    await expect(card(page).getByRole("link", { name: featured.name })).toHaveAttribute("href", gameLink(featured, "en"));
  });

  test("with a note, a tap opens it on a phone", async ({ page }) => {
    test.skip(!note, "the featured game has no note yet");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.getByRole("button", { name: en.featured.readNote }).click();
    await expect(card(page).locator(".game__note")).toBeVisible();
  });
});
