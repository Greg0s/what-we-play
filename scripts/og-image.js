/**
 * Draws the link previews, `public/what-we-play-preview-<lang>.jpg` (1200 ×
 * 630, one per language), from the built site itself: the banner's real
 * bubble, sticker and 3D Mac with a pawn per player, rearranged by injected
 * CSS. Nothing the visitor can press is drawn. The title is « What we play? »
 * in every language; the tape, the sticker and the alt come from `preview` in
 * the locale files.
 *
 *   pnpm run build && pnpm run og-image
 *
 * Then bump PREVIEW_VERSION in src/pageMeta.ts: social sites cache an image by
 * its URL. Needs a Chromium for Playwright and network access to Google Fonts
 * (Honk and Archivo). Set CHROMIUM_PATH to use a Chromium other than
 * Playwright's.
 */
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { en } from "../src/i18n/locales/en.ts";
import { fr } from "../src/i18n/locales/fr.ts";
import { es } from "../src/i18n/locales/es.ts";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const origin = "http://og.local";

const WIDTH = 1200;
const HEIGHT = 630;
const TITLE = ["What we", "play?"];

/* Each language's home page: 4 players, so four pawns. */
const languages = {
  en: { path: "/", t: en },
  fr: { path: "/fr/", t: fr },
  es: { path: "/es/", t: es },
};

/* Everything but the banner goes, and the keypad with it; the banner fills the frame. */
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
  .deck, .cord, .tab, .fab-dock, .tv-say { display: none !important; }

  .bubble { left: 70px; top: 60px; width: auto; padding: 26px 40px 32px 36px; }
  .b-h1 { font-size: 132px !important; line-height: 0.92; }
  .tail { top: 112px; }
  .studio .tv { --u: 1.3px; left: 720px; top: 110px; }
  .badge2 { left: 1040px; top: 70px; width: 132px; height: 132px; font-size: 13.5px; }

  .og-tape {
    position: absolute; z-index: 2; margin: 0;
    left: 86px; top: 444px; transform: rotate(-2deg);
    padding: 8px 16px 7px;
    background: #ffe14d; color: #17121c;
    border: 3px solid #17121c; border-radius: 6px;
    box-shadow: 4px 4px 0 #17121c;
    font-stretch: 125%; font-weight: 800; font-size: 22px; letter-spacing: 0.05em;
    text-transform: uppercase; white-space: nowrap;
  }
`;

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

for (const [lang, { path, t }] of Object.entries(languages)) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, reducedMotion: "reduce" });

  // Serve dist/ from a made-up origin: the build's asset URLs are absolute.
  await page.route(`${origin}/**`, async (route) => {
    let file = new URL(route.request().url()).pathname;
    if (file.endsWith("/")) file += "index.html";
    try {
      const body = await readFile(join(dist, file));
      await route.fulfill({ body, contentType: types[extname(file)] ?? "application/octet-stream" });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  // Light theme and the 3D Mac, whatever the machine prefers.
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("what-we-play:theme", "light");
    localStorage.setItem("what-we-play:relief", "3d");
  });

  await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: css });
  await page.evaluate(
    ({ title, sticker, tape }) => {
      document.documentElement.dataset.intro = "done";
      const h1 = document.querySelector(".b-h1");
      h1.style.fontSize = "";
      h1.classList.remove("is-long");
      h1.innerHTML = title.map((line) => `<span>${line}</span>`).join(" ");
      document.querySelector(".badge2").textContent = sticker;

      const el = document.createElement("p");
      el.className = "og-tape";
      el.textContent = tape;
      document.querySelector(".stage").append(el);
    },
    { title: TITLE, sticker: t.preview.sticker, tape: t.preview.tape },
  );
  // Let the pawns land.
  await page.waitForTimeout(800);

  const file = `what-we-play-preview-${lang}.jpg`;
  await writeFile(join(root, "public", file), await page.locator(".studio").screenshot({ type: "jpeg", quality: 88 }));
  console.log(`og-image: public/${file}`);
  await page.close();
}
await browser.close();
