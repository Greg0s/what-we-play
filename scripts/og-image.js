/**
 * Draws link previews (1200 × 630) from the built site itself: the banner's
 * real bubble, TV and sticker, plus floppies, rearranged by injected CSS.
 * Nothing the visitor can press is drawn. The title is the same in every
 * language; the rest of the text comes from the locale.
 *
 *   pnpm run build && node scripts/og-image.js [--variant=a,b] [--lang=en,fr] [--out=dir]
 *
 * Needs a Chromium for Playwright and network access to Google Fonts (Honk
 * and Archivo). Set CHROMIUM_PATH to use a Chromium other than Playwright's.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import { en } from "../src/i18n/locales/en.ts";
import { fr } from "../src/i18n/locales/fr.ts";
import { es } from "../src/i18n/locales/es.ts";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const origin = "http://og.local";

const WIDTH = 1200;
const HEIGHT = 630;
const PLAYERS = 4;
const TITLE = ["What we", "play?"];

/* What the preview says besides its title, per language. */
const copy = {
  en: { path: "/", t: en, sticker: "Free games picked by hand", tape: "Online games with friends" },
  fr: { path: "/fr/", t: fr, sticker: "Jeux gratuits choisis à la main", tape: "Des jeux en ligne entre amis" },
  es: { path: "/es/", t: es, sticker: "Juegos gratis elegidos a mano", tape: "Juegos online con amigos" },
};

/* Real games from the catalogue, one per genre, for the floppies. */
const FLOPPIES = [
  { name: "Gartic Phone", genre: "drawing" },
  { name: "Codenames", genre: "words" },
  { name: "PopSauce", genre: "trivia" },
  { name: "Blindtest.gg", genre: "music" },
];

const base = `
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
  .bubble { width: auto; padding: 26px 40px 32px 36px; }
  .b-h1 { font-size: 132px !important; line-height: 0.92; }
  .tail { top: 112px; }
  .badge2 { width: 132px; height: 132px; font-size: 13.5px; }

  .og-tape {
    position: absolute; z-index: 2; margin: 0;
    padding: 8px 16px 7px;
    background: #ffe14d; color: #17121c;
    border: 3px solid #17121c; border-radius: 6px;
    box-shadow: 4px 4px 0 #17121c;
    font-stretch: 125%; font-weight: 800; font-size: 22px; letter-spacing: 0.05em;
    text-transform: uppercase; white-space: nowrap;
  }
  .og-fl { position: absolute; z-index: 2; width: 236px; }
  .og-fl .floppy-w { position: static !important; width: 236px; transform: none !important; animation: none !important; }
`;

/* The proposals. Each one is CSS over the banner, plus what to add to it. */
const variants = {
  // The TV asks the question, with a tape that says what the site is.
  tv: {
    css: `
      .bubble { left: 80px; top: 70px; }
      .studio .tv { --u: 1.24px; left: 712px; top: 128px; }
      .badge2 { left: 1010px; top: 320px; }
      .og-tape { left: 96px; top: 452px; transform: rotate(-2deg); }
    `,
    tape: true,
  },
  // A draw: the TV has just ejected a floppy with a real game on it.
  draw: {
    css: `
      .bubble { left: 70px; top: 60px; }
      .studio .tv { --u: 1.24px; left: 720px; top: 90px; }
      .badge2 { left: 1040px; top: 420px; }
    `,
    floppies: [{ ...FLOPPIES[0], left: 530, top: 336, rotate: -10 }],
  },
  // The 3D Mac with a pawn per player.
  relief: {
    css: `
      .bubble { left: 70px; top: 60px; }
      .studio .tv { --u: 1.3px; left: 720px; top: 110px; }
      .badge2 { left: 1040px; top: 70px; }
      .og-tape { left: 86px; top: 444px; transform: rotate(-2deg); }
    `,
    relief: "3d",
    tape: true,
  },
  // The catalogue: floppies fanned out in front of the TV.
  shelf: {
    css: `
      .bubble { left: 70px; top: 60px; }
      .studio .tv { --u: 0.95px; left: 760px; top: 60px; }
      .badge2 { left: 1010px; top: 300px; transform: rotate(10deg) scale(0.9); }
      .og-fl { scale: 0.8; transform-origin: 50% 0; }
    `,
    genreOnly: true,
    floppies: [
      { ...FLOPPIES[0], left: 70, top: 392, rotate: -8 },
      { ...FLOPPIES[1], left: 290, top: 380, rotate: -3 },
      { ...FLOPPIES[2], left: 510, top: 386, rotate: 3 },
      { ...FLOPPIES[3], left: 730, top: 398, rotate: 8 },
    ],
  },
};

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

const { values: args } = parseArgs({
  options: {
    variant: { type: "string", default: Object.keys(variants).join(",") },
    lang: { type: "string", default: Object.keys(copy).join(",") },
    out: { type: "string", default: join(root, "public") },
  },
});
await mkdir(args.out, { recursive: true });

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

for (const name of args.variant.split(",")) {
  const variant = variants[name];
  for (const lang of args.lang.split(",")) {
    const { path, t, sticker, tape } = copy[lang];
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
    // Light theme; flat TV unless the variant wants the 3D one.
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript((relief) => {
      localStorage.setItem("what-we-play:theme", "light");
      localStorage.setItem("what-we-play:relief", relief);
    }, variant.relief ?? "2d");

    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: base + variant.css });

    const floppies = (variant.floppies ?? []).map((f) => ({
      ...f,
      band: variant.genreOnly
        ? t.genres[f.genre].chip
        : `${t.genres[f.genre].band} · ${PLAYERS} ${t.header.players.other}`,
    }));
    await page.evaluate(
      ({ title, sticker, tape, floppies }) => {
        document.documentElement.dataset.intro = "done";
        const h1 = document.querySelector(".b-h1");
        h1.style.fontSize = "";
        h1.classList.remove("is-long");
        h1.innerHTML = title.map((line) => `<span>${line}</span>`).join(" ");
        document.querySelector(".badge2").textContent = sticker;

        const stage = document.querySelector(".stage");
        if (tape) {
          const el = document.createElement("p");
          el.className = "og-tape";
          el.textContent = tape;
          stage.append(el);
        }
        for (const f of floppies) {
          const longest = f.name.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0);
          const size = longest > 10 ? Math.max(20, Math.floor(340 / longest)) : 34;
          const el = document.createElement("div");
          el.className = "drawer-in og-fl";
          el.style.left = `${f.left}px`;
          el.style.top = `${f.top}px`;
          el.style.transform = `rotate(${f.rotate}deg)`;
          el.innerHTML = `<div class="floppy-w"><div class="floppy">
            <span class="shutter"><span class="shutter-win"></span></span>
            <div class="lbl"><span class="lbl-band gc-${f.genre}">${f.band}</span>
            <span class="lbl-name" style="font-size:${size}px">${f.name}</span></div>
            <span class="notch"></span></div></div>`;
          stage.append(el);
        }
      },
      { title: TITLE, sticker, tape: variant.tape ? tape : null, floppies },
    );
    await page.waitForTimeout(800);

    const file = join(args.out, `og-${name}-${lang}.jpg`);
    await writeFile(file, await page.locator(".studio").screenshot({ type: "jpeg", quality: 88 }));
    console.log(`og-image: ${file}`);
    await page.close();
  }
}
await browser.close();
