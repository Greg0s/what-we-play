import { test, expect } from "@playwright/test";
import { gamesForPlayerCount } from "../src/games";
import { translations } from "../src/i18n/locales";
import { en } from "../src/i18n/locales/en";
import { rerollTier } from "../src/pickLines";

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

    // A reroll keeps the drawer and moves the TV on to one of its cheerful lines.
    const first = await name.textContent();
    await drawer.getByRole("button", { name: en.pick.reroll }).click();
    await expect(name).not.toHaveText(first ?? "");
    expect(en.pick.rerollLines[0]).toContain(await page.locator(".tv-say").textContent());
    expect(names).toContain(await name.textContent());

    await page.getByRole("button", { name: en.pick.close }).click();
    await expect(name).toHaveCount(0);
  });

  test("rerolls never repeat a game, nor a line, until the others have come up, and the TV says so", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await page.getByRole("button", { name: en.pick.button }).click();

    const name = page.locator("#pick-name");
    const say = page.locator(".tv-say");
    const drawn: string[] = [];
    let said = "";
    // The lines of each tier said since its round started over.
    const rounds = new Map<number, Set<string>>();
    const reroll = async () => {
      await page.getByRole("button", { name: en.pick.reroll }).click();
      await expect(name).not.toHaveText(drawn[drawn.length - 1]);
    };
    for (let draw = 0; draw < names.length; draw++) {
      if (draw > 0) await reroll();
      const line = (await say.textContent()) ?? "";
      if (draw === 0) expect(line).toBe(en.pick.firstLine(4));
      else if (draw === names.length - 1) expect(line).toBe(en.pick.lastLine);
      else {
        // One of the current tier's lines, none again before the others, never twice in a row.
        const tier = rerollTier(draw);
        const lines = en.pick.rerollLines[tier];
        expect(lines).toContain(line);
        const round = rounds.get(tier) ?? new Set<string>();
        if (round.size === lines.length) round.clear();
        expect(round).not.toContain(line);
        round.add(line);
        rounds.set(tier, round);
        expect(line).not.toBe(said);
      }
      said = line;
      drawn.push((await name.textContent()) ?? "");
    }
    expect([...drawn].sort()).toEqual([...names].sort());

    // The deck starts over: the TV notices.
    await reroll();
    expect(en.pick.againLines).toContain(await say.textContent());
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
    // A waiting screen holds the empty slot meanwhile…
    const loader = screen.locator(".ps-loader");
    await expect(loader).toBeVisible();
    // Nor a reroll before the first game is out.
    const reroll = screen.locator(".reroll");
    await expect(reroll).toBeHidden();
    await expect(screen.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(reroll).toBeVisible();
    // …and is gone once the ticket is out, and stays gone.
    await expect(loader).toHaveCount(0);
    expect(names).toContain(await screen.getByRole("heading", { level: 2 }).textContent());
    expect(page.url()).toBe(before);

    // A reroll moves the TV on to one of its cheerful lines.
    await reroll.click();
    await expect(screen.locator("#pick-say")).not.toHaveText(en.pick.firstLine(4));
    expect(en.pick.rerollLines[0]).toContain(await screen.locator("#pick-say").textContent());

    await screen.getByRole("button", { name: en.pick.back }).click();
    await expect(screen).toHaveCount(0);
    await expect(fab).toBeFocused();
  });
});

/** Every line the TV can say with a draw, in every language. */
const allLines = Object.values(translations).flatMap(({ pick }) => [
  pick.firstLine(1),
  pick.firstLine(10),
  ...pick.rerollLines.flat(),
  pick.lastLine,
  ...pick.againLines,
  pick.fewLine,
]);

test.describe("Pick for us — the TV's lines fit its bubble", () => {
  // The drawer's bubble holds one line: a longer sentence spills out of it.
  for (const width of [1440, 800]) {
    test(`on one line at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.getByRole("button", { name: en.pick.button }).click();
      const say = page.locator(".tv-say");
      await expect(say).toBeVisible();
      const spills = await say.evaluate((el, lines) => {
        return lines.filter((line) => {
          el.textContent = line;
          return el.scrollWidth > el.clientWidth;
        });
      }, allLines);
      expect(spills).toEqual([]);
    });
  }

  // The phone's bubble wraps, but has room for three lines on the TV's screen.
  test("on three lines at most on a 360 px phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await page.locator(".fab").click();
    const say = page.locator("#pick-say");
    await expect(say).toBeVisible();
    const spills = await say.evaluate((el, lines) => {
      return lines.filter((line) => {
        el.textContent = line;
        return el.getBoundingClientRect().height > el.parentElement!.getBoundingClientRect().height;
      });
    }, allLines);
    expect(spills).toEqual([]);
  });
});
