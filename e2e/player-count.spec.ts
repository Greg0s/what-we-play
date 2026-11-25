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

  test("a key still switches in place with Umami loaded, and is counted", async ({ page }) => {
    // Umami's tracker, reduced to its click rule: in the capture phase, a
    // same-tab link carrying `data-umami-event` is followed by Umami itself
    // (`location.href = href`) once the event is sent, which reloaded the page.
    await page.route("https://umami-y1mc.vercel.app/script.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: `
          window.umamiEvents = [];
          window.umami = { track: (name, data) => { window.umamiEvents.push({ name, data }); return Promise.resolve(); } };
          document.addEventListener("click", (e) => {
            const el = e.target.closest("a, button");
            const name = el && el.getAttribute("data-umami-event");
            if (!name) return;
            const data = {};
            for (const attr of el.getAttributeNames()) {
              const match = attr.match(/^data-umami-event-([\\w-]+)$/);
              if (match) data[match[1]] = el.getAttribute(attr);
            }
            if (el.tagName === "A" && el.href && el.target !== "_blank") {
              e.preventDefault();
              window.umami.track(name, data).then(() => { location.href = el.href; });
            } else {
              window.umami.track(name, data);
            }
          }, true);
        `,
      }),
    );
    await page.goto("/");
    await page.waitForFunction(() => "umami" in window);
    await page.evaluate(() => ((window as Window & { stayed?: boolean }).stayed = true));

    const keypad = page.getByRole("navigation", { name: en.header.playerCount });
    await keypad.getByRole("link", { name: "3", exact: true }).click();
    await expect(page).toHaveURL(/\/games-for-3-players\/$/);
    await expect(page.locator(".grid .game")).toHaveCount(gamesForPlayerCount(3).length);

    expect(await page.evaluate(() => (window as Window & { stayed?: boolean }).stayed)).toBe(true);
    expect(await page.evaluate(() => (window as Window & { umamiEvents?: unknown[] }).umamiEvents)).toEqual([
      { name: "Player count", data: { players: "3" } },
    ]);
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
