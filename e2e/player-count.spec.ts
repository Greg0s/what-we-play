import { test, expect } from "@playwright/test";
import { gamesForPlayerCount } from "../src/games";
import { PLAYER_COUNT_PAGES, buildPath } from "../src/routes";
import { en } from "../src/i18n/locales/en";

test.describe("Player count keypad", () => {
  test("each key is a real link to its page, and a click switches in place", async ({ page }) => {
    await page.goto("/");

    const keypad = page.getByRole("navigation", { name: en.header.playerCount });
    const two = keypad.getByRole("link", { name: "2", exact: true });
    await expect(two).toHaveAttribute("href", "/games-for-2-players/");

    await two.click();
    await expect(page).toHaveURL(/\/games-for-2-players\/$/);
    await expect(two).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.header.question(2).join(" "));
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(2).length);
  });

  test("10+ opens a stepper that goes past ten and floors at ten", async ({ page }) => {
    await page.goto("/games-for-9-players/");

    await page.getByRole("link", { name: "10+", exact: true }).click();
    await expect(page).toHaveURL(/\/games-for-10-players\/$/);

    const more = page.getByRole("button", { name: en.header.addPlayer, exact: true });
    const less = page.getByRole("button", { name: en.header.removePlayer, exact: true });
    await more.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.header.question(11).join(" "));
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(11).length);

    await less.click();
    await less.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.header.question(10).join(" "));
  });

  test("the TV's call fits its screen at every player count", async ({ page }) => {
    for (const players of PLAYER_COUNT_PAGES) {
      await page.goto(buildPath({ language: "en", players, isHome: false }));
      const screen = await page.locator(".tv-body .scr").boundingBox();
      const tiles = await page.locator(".tv-body .scr .tile").evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().toJSON() as DOMRect),
      );
      expect(screen, `screen at ${players}`).not.toBeNull();
      for (const tile of tiles) {
        expect(tile.bottom, `tile bottom at ${players} players`).toBeLessThanOrEqual(screen!.y + screen!.height + 0.5);
        expect(tile.right, `tile right at ${players} players`).toBeLessThanOrEqual(screen!.x + screen!.width + 0.5);
      }
    }
  });
});
