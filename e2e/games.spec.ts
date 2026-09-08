import { test, expect } from "@playwright/test";
import { DEFAULT_PLAYERS, gamesForPlayerCount } from "../src/games";

test.describe("Game catalogue", () => {
  test("shows the games for the default player count on load", async ({ page }) => {
    const expected = gamesForPlayerCount(DEFAULT_PLAYERS);

    await page.goto("/");

    await expect(page.locator(".grid .game")).toHaveCount(expected.length);
    for (const game of expected) {
      await expect(page.getByRole("heading", { name: game.name, level: 2 })).toBeVisible();
    }

    await expect(page.locator(".empty")).toHaveCount(0);
  });

  test("each card links out to the game and shows its player range", async ({ page }) => {
    await page.goto("/");

    const first = page.locator(".grid .game").first();
    await expect(first).toHaveAttribute("href", /^https?:\/\//);
    await expect(first).toHaveAttribute("target", "_blank");
    await expect(first).toHaveAttribute("rel", "noopener");
    await expect(first.locator(".game__range")).toBeVisible();
  });
});
