import { test, expect } from "@playwright/test";
import { DEFAULT_PLAYERS, gameFavicon, games, gamesForPlayerCount } from "../src/games";

test.describe("Game favicons", () => {
  // Favicons load lazily (see src/components/game.tsx), so the viewport is
  // made tall enough that the whole grid sits inside it on load — otherwise
  // the below-the-fold ones never fetch and this would test nothing.
  test.use({ viewport: { width: 1280, height: 4000 } });

  test("every game card's favicon loads successfully", async ({ page }) => {
    test.setTimeout(45000);

    await page.goto("/");

    const favicons = page.locator(".game__favicon");
    await expect(favicons).toHaveCount(gamesForPlayerCount(DEFAULT_PLAYERS).length);

    await expect
      .poll(
        () =>
          favicons.evaluateAll((images) =>
            (images as HTMLImageElement[]).every(
              (image) => image.complete && image.naturalWidth > 0,
            ),
          ),
        { timeout: 30000, message: "expected every favicon <img> to finish loading" },
      )
      .toBe(true);
  });

  // Google answers a host it has no icon for with a grey globe *and* a 404:
  // the <img> still loads, so the test above can't see it. Such a game needs
  // its own icon in public/favicons/ (see docs/adding-a-game.md).
  test("every game has a real icon, not Google's fallback globe", async ({ page }) => {
    test.setTimeout(60000);
    // Every game, whatever the player count. Opening each icon as a page
    // gives its status straight from the network.
    const missing: string[] = [];
    for (const game of games) {
      const response = await page.goto(gameFavicon(game));
      const status = response?.status() ?? 0;
      if (status === 0 || status >= 400) missing.push(`${game.id} (${status})`);
    }
    expect(missing, "games whose favicon is missing").toEqual([]);
  });
});
