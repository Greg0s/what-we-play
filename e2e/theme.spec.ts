import { test, expect } from "@playwright/test";
import { en } from "../src/i18n/locales/en";
import { STORAGE_KEY } from "../src/theme/config";

test.describe("Theme switcher", () => {
  test.use({ colorScheme: "light" });

  test("toggles dark mode and persists the choice across reloads", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme");

    await page.getByRole("button", { name: en.theme.dark }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
      .toBe("dark");

    // The choice is read back before the first paint, so it survives a reload
    // with no flash of the other theme.
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: en.theme.light }).click();
    await expect(html).not.toHaveAttribute("data-theme");
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
      .toBe("light");
  });

  test("defaults to the OS preference on a first visit", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await context.close();
  });

  // Safari tints its toolbar with theme-color: it must follow the theme from
  // the first paint, which only the inline script in index.html can do.
  test("tints the browser's toolbar dark before any bundle runs", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    // Block the app's bundle: only the inline script is left to set it.
    await page.route("**/assets/*.js", (route) => route.abort());

    await page.goto("/");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#141017");

    await context.close();
  });
});
