import { test, expect } from "@playwright/test";
import { en } from "../src/i18n/locales/en";
import { STORAGE_KEY } from "../src/relief/config";

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
});
