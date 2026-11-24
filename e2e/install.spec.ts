import { test, expect, type Page } from "@playwright/test";
import { fr } from "../src/i18n/locales/fr";
import { RETURN_DWELL_MS, SESSION_KEY, STORAGE_KEY } from "../src/install/config";

/** A returning visitor: one past visit on record, this one makes two. */
async function seed(page: Page, state: Record<string, unknown>) {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [STORAGE_KEY, JSON.stringify(state)] as const,
  );
}

/** What Chromium fires once the site is installable, with a dialog we can watch. */
async function fireInstallable(page: Page, outcome: "accepted" | "dismissed" = "accepted") {
  await page.evaluate((outcome) => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt: async () => {
        (window as unknown as { prompted: boolean }).prompted = true;
      },
      userChoice: Promise.resolve({ outcome, platform: "web" }),
    });
    window.dispatchEvent(event);
  }, outcome);
}

const card = (page: Page) => page.locator(".install");

/**
 * The invitation's timers start once the app has hydrated, which takes longer
 * in WebKit: moving the clock before that would skip past timers not yet set.
 * The visit is counted in the same effect, so its mark says they are.
 */
async function hydrated(page: Page) {
  await page.waitForFunction((key) => sessionStorage.getItem(key) !== null, SESSION_KEY);
}

/** Its entrance moves it; measure it where it rests. */
async function settled(page: Page) {
  await card(page).evaluate((element) => Promise.all(element.getAnimations().map((a) => a.finished)));
}

test.describe("where the browser can install", () => {
  test("a returning visitor is invited after browsing a while, and can install", async ({ page }) => {
    await page.clock.install();
    await seed(page, { visits: 1 });
    await page.goto("/fr/");
    await hydrated(page);
    await fireInstallable(page);

    await page.clock.fastForward(RETURN_DWELL_MS - 2_000);
    await expect(card(page)).toHaveCount(0);
    await page.clock.fastForward(3_000);
    await expect(card(page)).toContainText(fr.install.title);

    await card(page).getByRole("button", { name: fr.install.accept }).click();
    await expect(card(page)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { prompted?: boolean }).prompted)).toBe(true);
    await expect
      .poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).installed, STORAGE_KEY))
      .toBe(true);
  });

  test("a first visit that opened no game is left alone", async ({ page }) => {
    await page.clock.install();
    await page.goto("/fr/");
    await hydrated(page);
    await fireInstallable(page);
    await page.clock.fastForward(RETURN_DWELL_MS * 3);
    await expect(card(page)).toHaveCount(0);
  });

  test("a first visit is invited on coming back from a second game", async ({ page, context }) => {
    await page.clock.install();
    await page.goto("/fr/");
    await hydrated(page);
    await fireInstallable(page);
    // The games open in new tabs: stop them there, only the click matters.
    await context.route((url) => url.hostname !== "localhost", (route) => route.abort());

    for (const game of (await page.locator(".game").all()).slice(0, 2)) {
      const popup = context.waitForEvent("page");
      await game.click();
      await (await popup).close();
    }
    await expect(card(page)).toHaveCount(0);

    // Back on the tab.
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await page.clock.fastForward(2_000);
    await expect(card(page)).toContainText(fr.install.native);
  });

  test("« Plus tard » holds on the next visits", async ({ page, context }) => {
    await page.clock.install();
    await seed(page, { visits: 1 });
    await page.goto("/fr/");
    await hydrated(page);
    await fireInstallable(page);
    await page.clock.fastForward(RETURN_DWELL_MS + 1_000);
    await card(page).getByRole("button", { name: fr.install.later }).click();
    await expect(card(page)).toHaveCount(0);

    // A new tab is a new visit.
    const next = await context.newPage();
    await next.clock.install();
    await next.goto("/fr/");
    await hydrated(next);
    await fireInstallable(next);
    await next.clock.fastForward(RETURN_DWELL_MS * 2);
    await expect(card(next)).toHaveCount(0);
  });
});

test.describe("iOS Safari", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
  });

  test("explains Share then Add to Home Screen, above « Pick for us »", async ({ page }) => {
    await page.clock.install();
    await seed(page, { visits: 1 });
    await page.goto("/fr/");
    await hydrated(page);
    await page.clock.fastForward(RETURN_DWELL_MS + 1_000);

    await expect(card(page)).toContainText(fr.install.ios.share);
    await expect(card(page)).toContainText(fr.install.ios.add);
    await settled(page);
    const box = (await card(page).boundingBox())!;
    const fab = (await page.locator(".fab").boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(fab.y);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);

    await card(page).getByRole("button", { name: fr.install.close }).click();
    await expect(card(page)).toHaveCount(0);
  });

  test("never inside the installed app", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "standalone", { value: true });
    });
    await page.clock.install();
    await seed(page, { visits: 5 });
    await page.goto("/fr/");
    // The app never counts a visit there: it notes it is installed instead.
    await page.waitForFunction((key) => localStorage.getItem(key)?.includes('"installed":true'), STORAGE_KEY);
    await page.clock.fastForward(RETURN_DWELL_MS * 2);
    await expect(card(page)).toHaveCount(0);
  });
});
