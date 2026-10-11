/**
 * Draws the link preview (`public/what-we-play-metadata.jpg`, 1200 × 630) from
 * the built site itself: the banner's real bubble, TV, keypad, cord and
 * sticker, rearranged for the preview's proportions. Redrawing it after a
 * change to the banner's look keeps the preview in step with the site.
 *
 *   pnpm run build && pnpm run og-image
 *
 * Needs a Chromium for Playwright and network access to Google Fonts (Honk
 * and Archivo). Set CHROMIUM_PATH to use a Chromium other than Playwright's.
 * Social sites cache the image by URL: after redrawing it, bump the `?v=` on
 * `og:image` and `twitter:image` in index.html so shared links pick it up.
 */
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const out = join(root, "public", "what-we-play-metadata.jpg");
const origin = "http://og.local";

const WIDTH = 1200;
const HEIGHT = 630;

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

/* Everything but the banner goes; the banner fills the frame, edge to edge. */
const css = `
  html, body { margin: 0; background: transparent; overflow: hidden; }
  #root > *:not(main), main > *:not(.studio) { display: none !important; }
  #root, main { margin: 0 !important; padding: 0 !important; max-width: none !important; }
  .studio {
    margin: 0 !important;
    width: ${WIDTH}px; height: ${HEIGHT}px;
    border: 0; border-radius: 0; box-shadow: none;
    overflow: hidden;
  }
  .stage { width: ${WIDTH}px !important; height: ${HEIGHT}px !important; transform: none !important; }

  .bubble { left: 100px; top: 56px; width: auto; padding: 26px 40px 32px 36px; }
  .b-h1 { font-size: 132px !important; line-height: 0.92; }
  .tail { top: 112px; }

  .studio .tv { --u: 1.2px; left: 706px; top: 150px; }
  .badge2 { left: 1006px; top: 330px; width: 124px; height: 124px; font-size: 13.5px; }

  .deck { left: 100px; top: 404px; }
  .tab, .fab-dock { display: none !important; }
  .cord { left: 616px; top: 500px; }
`;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({
  viewport: { width: 1400, height: 900 },
  reducedMotion: "reduce",
});

// Serve dist/ from a made-up origin: the build's asset URLs are absolute.
await page.route(`${origin}/**`, async (route) => {
  let path = new URL(route.request().url()).pathname;
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(dist, path));
    await route.fulfill({ body, contentType: types[extname(path)] ?? "application/octet-stream" });
  } catch {
    await route.fulfill({ status: 404 });
  }
});
// Light theme and flat TV, whatever the machine prefers.
await page.emulateMedia({ colorScheme: "light" });

await page.goto(`${origin}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: css });
await page.evaluate(() => {
  document.documentElement.dataset.intro = "done";
  const h1 = document.querySelector(".b-h1");
  h1.style.fontSize = "";
  h1.classList.remove("is-long");
  h1.innerHTML = "<span>What we</span> <span>play?</span>";
  document.querySelector(".badge2").textContent = "Free games picked by hand";
});
await page.waitForTimeout(500);

const studio = page.locator(".studio");
const jpg = await studio.screenshot({ type: "jpeg", quality: 88 });
await writeFile(out, jpg);
await browser.close();
console.log(`og-image: ${WIDTH} × ${HEIGHT} written to public/what-we-play-metadata.jpg`);
