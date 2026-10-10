import { test, expect } from "@playwright/test";
import { LANGUAGES } from "../src/i18n/config";
import { en } from "../src/i18n/locales/en";
import { STORAGE_KEY } from "../src/relief/config";
import { PLAYER_COUNT_PAGES, buildPath } from "../src/routes";

/**
 * What the banner's 3D crowd covers on a phone: the pawns and the « +N » sign
 * that overlap the keypad's tape, come within 2 px of a key, or run into the
 * bubble or the banner's right edge. Empty when everything stands clear.
 */
function crowdOverlaps() {
  const box = (node: Element) => node.getBoundingClientRect();
  const studio = document.querySelector(".studio")!;
  const tape = box(studio.querySelector(".tape")!);
  const bubble = box(studio.querySelector(".bubble")!);
  const keys = [...studio.querySelectorAll(".pad-key")].map(box);
  const right = box(studio).right - 5;
  const hits = (a: DOMRect, b: DOMRect) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  const figures = [...studio.querySelectorAll(".m3-pawn:not(.is-out)")].map((pawn) => {
    // The body and its base: the base is the wider of the two.
    const body = box(pawn.querySelector(".m3-pbody")!);
    const base = box(pawn.querySelector(".m3-pbase")!);
    const left = Math.min(body.left, base.left);
    return {
      name: pawn.className,
      rect: new DOMRect(left, body.top, Math.max(body.right, base.right) - left, base.bottom - body.top),
    };
  });
  const sign = studio.querySelector(".m3-sign:not(.is-out) .m3-board");
  if (sign) figures.push({ name: "sign", rect: box(sign) });

  return figures.flatMap(({ name, rect }) =>
    [
      hits(rect, tape) && "tape",
      keys.some((key) => rect.left < key.right && rect.right > key.left && rect.bottom > key.top - 2) && "keys",
      hits(rect, bubble) && "bubble",
      rect.right > right && "edge",
    ]
      .filter(Boolean)
      .map((what) => `${name} / ${what}`),
  );
}

test.describe("2D / 3D glasses", () => {
  test("switch the TV to 3D, remember it, and switch back", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");
    const glasses = page.getByRole("button", { name: en.relief.to3d });
    await expect(html).not.toHaveAttribute("data-relief");
    await expect(page.locator(".tv-body").first()).toBeVisible();
    await expect(page.locator(".m3-set").first()).toBeHidden();

    await glasses.click();
    const back = page.getByRole("button", { name: en.relief.to2d });
    await expect(back).toHaveAttribute("aria-pressed", "true");
    await expect(html).toHaveAttribute("data-relief", "3d");
    await expect(page.locator(".m3-set").first()).toBeVisible();
    await expect(page.locator(".tv-body").first()).toBeHidden();
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
      .toBe("3d");

    // Read back before the first paint, like the theme: no flat TV flashing first.
    await page.reload();
    await expect(html).toHaveAttribute("data-relief", "3d");
    await expect(page.getByRole("button", { name: en.relief.to2d })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: en.relief.to2d }).click();
    await expect(html).not.toHaveAttribute("data-relief");
    await expect(page.locator(".tv-body").first()).toBeVisible();
  });

  // The phone banner keeps the tape at the left and the Mac at the right edge,
  // so the room between them shrinks with the screen: 360 px is the tight case
  // (smaller pawns below 400 px), 412 px the roomy one (Pixel 9).
  for (const width of [360, 412]) {
    test(`on a ${width} px phone, the pawns stand clear of the tape, the keys and the bubble`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((key) => localStorage.setItem(key, "3d"), STORAGE_KEY);
      for (const language of LANGUAGES) {
        for (const players of PLAYER_COUNT_PAGES) {
          await page.goto(buildPath({ language, players, isHome: false }));
          await page.evaluate(() => document.fonts.ready);
          expect(await page.evaluate(crowdOverlaps), `${language}, ${players} players`).toEqual([]);
        }
        // Past ten, the « +N » sign joins the crowd.
        await page.locator(".tab-key").last().click();
        await expect(page.locator(".studio .m3-sign")).not.toHaveClass(/is-out/);
        await expect.poll(() => page.evaluate(crowdOverlaps), `${language}, 11 players`).toEqual([]);
      }
    });
  }
});
