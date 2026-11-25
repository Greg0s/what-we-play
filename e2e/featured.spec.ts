import { test, expect, type Page } from "@playwright/test";
import { games, gameLink } from "../src/games";
import { en, type Translation } from "../src/i18n/locales/en";

const featured = games.find((game) => game.featured);
const note = featured ? (en as Translation).featuredNotes[featured.id as keyof Translation["featuredNotes"]] : undefined;
const path = featured ? `/games-for-${Math.max(2, featured.minPlayers)}-players/` : "/";

const card = (page: Page) => page.locator(".grid .game").first();
const tv = (page: Page) => card(page).locator(".game__tv");

test.describe("Coup de cœur", () => {
  test.skip(!featured, "no game is featured in games.json");

  test("the featured game leads the list, with its tag and the small TV", async ({ page }) => {
    await page.goto(path);
    await expect(card(page).locator("h3")).toHaveText(featured!.name);
    await expect(card(page).locator(".game__tag.is-featured")).toHaveText(en.catalogue.tagFeatured);
    await expect(tv(page)).toBeVisible();
    await expect(page.locator(".grid .game__tv")).toHaveCount(1);
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
    expect(href).toBe(gameLink(featured!, "en"));
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
    await expect(card(page).getByRole("link", { name: featured!.name })).toHaveAttribute("href", gameLink(featured!, "en"));
  });

  test("with a note, a tap opens it on a phone", async ({ page }) => {
    test.skip(!note, "the featured game has no note yet");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.getByRole("button", { name: en.featured.readNote }).click();
    await expect(card(page).locator(".game__note")).toBeVisible();
  });
});
