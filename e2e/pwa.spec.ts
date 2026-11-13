import { test, expect, type APIRequestContext } from "@playwright/test";
import { buildPath } from "../src/routes";

/** Width and height of a PNG, read from its IHDR chunk. */
async function pngSize(request: APIRequestContext, url: string) {
  const response = await request.get(url);
  expect(response.status(), url).toBe(200);
  const bytes = await response.body();
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

test("the manifest makes the site installable", async ({ page, request }) => {
  await page.goto("/fr/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBe("/manifest.webmanifest");

  const manifest = await (await request.get(href!)).json();
  expect(manifest.name).toBe("What we play?");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");

  // Chrome wants a 192 and a 512; Android's shapes want a maskable one.
  for (const icon of manifest.icons) {
    expect(await pngSize(request, icon.src)).toBe(icon.sizes);
  }
  const purposes = manifest.icons.map((icon: { purpose: string }) => icon.purpose);
  expect(purposes).toContain("maskable");

  // iOS before 16.4 ignores the manifest.
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
    "content",
    "yes",
  );
});

test.describe("offline", () => {
  // The rest of the suite blocks service workers (playwright.config.ts).
  test.use({ serviceWorkers: "allow" });

  test("the app still opens without a network", async ({ page, context, browserName }) => {
    // Playwright's offline switch only reaches a service worker's own fetches
    // in Chromium.
    test.skip(browserName !== "chromium", "offline emulation of service workers");

    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await context.setOffline(true);

    // A precached landing page, in another language than the one visited.
    await page.goto("/fr/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".game").first()).toBeVisible();

    // A page never visited: its language's landing, URL and all, so the
    // markup matches the URL and hydration holds.
    const unseen = buildPath({ language: "es", players: 6, isHome: false });
    await page.goto(unseen);
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page.locator(".game").first()).toBeVisible();
  });
});
