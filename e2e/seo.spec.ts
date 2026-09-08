import { test, expect } from "@playwright/test";
import { gamesForPlayerCount } from "../src/games";
import { pageMeta } from "../src/pageMeta";
import { buildPath, type Route } from "../src/routes";

/**
 * A light, served-page smoke test: does a real request for this URL, through
 * a real browser, come back with the tags an engine needs? The exhaustive
 * audit (reciprocal hreflang across all 33 pages, JSON-LD shape, sitemap
 * coverage) is scripts/check-seo.js, run on every build — see CLAUDE.md.
 */
const routes: Route[] = [
  { language: "en", players: 4, isHome: true },
  { language: "fr", players: 4, isHome: true },
  { language: "es", players: 3, isHome: false },
];

test.describe("SEO essentials", () => {
  for (const route of routes) {
    test(`${route.language} · ${route.isHome ? "landing" : `${route.players} players`} page carries the essentials`, async ({
      page,
    }) => {
      await page.goto(buildPath(route));

      const { title, description } = pageMeta(route);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        description,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", route.language);

      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      // en, fr, es and x-default.
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);

      const jsonLdBlocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      expect(jsonLdBlocks.length).toBeGreaterThan(0);

      const blocks = jsonLdBlocks.map((raw) => JSON.parse(raw));
      const collectionPage = blocks.find((block) => block["@type"] === "CollectionPage");
      expect(collectionPage).toBeTruthy();

      const items = collectionPage.mainEntity.itemListElement;
      const expectedGames = gamesForPlayerCount(route.players);
      expect(items).toHaveLength(expectedGames.length);
      expect(collectionPage.mainEntity.numberOfItems).toBe(expectedGames.length);
    });
  }
});
