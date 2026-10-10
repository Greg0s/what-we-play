import { test, expect } from "@playwright/test";
import { gamesForPlayerCount } from "../src/games";
import { en } from "../src/i18n/locales/en";

const names = gamesForPlayerCount(4).map((game) => game.name);

test.describe("Pick for us — wide screens", () => {
  test("the Enter key draws a game into a drawer, the TV says so, and the sticker closes it", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: en.pick.button }).click();

    const drawer = page.getByRole("region", { name: /./ }).filter({ has: page.locator("#pick-name") });
    const name = page.locator("#pick-name");
    await expect(name).toBeVisible();
    expect(names).toContain(await name.textContent());
    await expect(page.locator(".tv-say")).toHaveText(en.pick.firstLine(4));
    await expect(drawer.getByRole("link", { name: new RegExp(en.pick.launch) })).toHaveAttribute("target", "_blank");

    // A reroll keeps the drawer and moves the TV on to its next line.
    await drawer.getByRole("button", { name: en.pick.reroll }).click();
    await expect(page.locator(".tv-say")).toHaveText(en.pick.rerollLines[0]);
    expect(names).toContain(await name.textContent());

    await page.getByRole("button", { name: en.pick.close }).click();
    await expect(name).toHaveCount(0);
  });

  test("Escape closes the drawer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: en.pick.button }).click();
    await expect(page.locator("#pick-name")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#pick-name")).toHaveCount(0);
  });

  test("nothing to draw from: the key says so and stays inert", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(en.catalogue.searchPlaceholder).fill("zzzznotagame");

    const key = page.getByRole("button", { name: en.pick.button });
    await expect(key).toHaveAttribute("aria-disabled", "true");
    await key.click({ force: true });
    await expect(page.locator("#pick-name")).toHaveCount(0);
  });
});

test.describe("Pick for us — phones", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("the floating button opens a pick screen with no URL of its own, Back closes it", async ({ page }) => {
    await page.goto("/");
    const before = page.url();

    const fab = page.locator(".fab");
    await fab.click();

    const screen = page.getByRole("dialog");
    await expect(screen).toBeVisible();
    await expect(screen.locator("#pick-say")).toHaveText(en.pick.firstLine(4));
    // The slot stays empty while the reels spin: no ticket before it ejects.
    await expect(screen.locator(".fl-move")).toHaveClass(/is-wait/);
    await expect(screen.getByRole("heading", { level: 2 })).toBeVisible();
    expect(names).toContain(await screen.getByRole("heading", { level: 2 }).textContent());
    expect(page.url()).toBe(before);

    await screen.getByRole("button", { name: en.pick.back }).click();
    await expect(screen).toHaveCount(0);
    await expect(fab).toBeFocused();
  });
});
