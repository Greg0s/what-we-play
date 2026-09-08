import { test, expect } from "@playwright/test";
import { DEFAULT_PLAYERS, gamesForPlayerCount } from "../src/games";

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
});
