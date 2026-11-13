/**
 * Draws the iOS launch screens, `public/splash/splash-<w>x<h>.png`: the logo
 * centred on white, like the home-screen icon, at every iPhone and iPad screen
 * size, portrait and landscape. iOS shows one while an app added to the home
 * screen starts, and only if its size matches the screen exactly — otherwise
 * it shows a blank white screen. Then rewrites the matching
 * `<link rel="apple-touch-startup-image">` tags in index.html, between the
 * splash markers.
 *
 *   pnpm run splash-screens
 *
 * Rerun it when the logo changes, or to add a new device to DEVICES. Needs a
 * Chromium for Playwright; set CHROMIUM_PATH to use another one.
 */
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "public", "splash");
const indexPath = join(root, "index.html");

const START = "<!--splash:start-->";
const END = "<!--splash:end-->";

/** The logo's height on screen, in CSS pixels, whatever the device. */
const LOGO_HEIGHT = 110;

/**
 * Every screen in CSS pixels (portrait) and its pixel ratio. Devices that share
 * all three share an image. Two that differ only by ratio (XR vs XS Max) don't.
 */
const DEVICES = [
  // iPhones
  { name: "iPhone 16/17 Pro Max", width: 440, height: 956, ratio: 3 },
  { name: "iPhone 14 Pro Max, 15/16 Plus, 15 Pro Max", width: 430, height: 932, ratio: 3 },
  { name: "iPhone 12/13 Pro Max, 14 Plus", width: 428, height: 926, ratio: 3 },
  { name: "iPhone Air", width: 420, height: 912, ratio: 3 },
  { name: "iPhone XS Max, 11 Pro Max", width: 414, height: 896, ratio: 3 },
  { name: "iPhone XR, 11", width: 414, height: 896, ratio: 2 },
  { name: "iPhone 6–8 Plus", width: 414, height: 736, ratio: 3 },
  { name: "iPhone 16 Pro, 17, 17 Pro", width: 402, height: 874, ratio: 3 },
  { name: "iPhone 14 Pro, 15, 15 Pro, 16", width: 393, height: 852, ratio: 3 },
  { name: "iPhone 12–14, 16e", width: 390, height: 844, ratio: 3 },
  { name: "iPhone X, XS, 11 Pro, 12/13 mini", width: 375, height: 812, ratio: 3 },
  { name: "iPhone 6–8, SE (2nd/3rd gen)", width: 375, height: 667, ratio: 2 },
  { name: "iPhone SE (1st gen), 5", width: 320, height: 568, ratio: 2 },
  // iPads
  { name: "iPad Pro 13 (M4)", width: 1032, height: 1376, ratio: 2 },
  { name: "iPad Pro 12.9, Air 13", width: 1024, height: 1366, ratio: 2 },
  { name: "iPad Pro 11 (M4)", width: 834, height: 1210, ratio: 2 },
  { name: "iPad Pro 11, Air 11 (M2)", width: 834, height: 1194, ratio: 2 },
  { name: "iPad Air 10.5", width: 834, height: 1112, ratio: 2 },
  { name: "iPad Air 10.9, iPad (10th gen+)", width: 820, height: 1180, ratio: 2 },
  { name: "iPad 10.2", width: 810, height: 1080, ratio: 2 },
  { name: "iPad 9.7, mini (5th gen)", width: 768, height: 1024, ratio: 2 },
  { name: "iPad mini (6th gen+)", width: 744, height: 1133, ratio: 2 },
];

const logo = (await readFile(join(root, "what-we-play.png"))).toString("base64");

function page(width, height) {
  return `<!doctype html><html><body style="margin:0;width:${width}px;height:${height}px;
    display:grid;place-items:center;background:#fff">
    <img src="data:image/png;base64,${logo}" style="height:${LOGO_HEIGHT}px"></body></html>`;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const tags = [];

for (const device of DEVICES) {
  for (const orientation of ["portrait", "landscape"]) {
    const [width, height] =
      orientation === "portrait" ? [device.width, device.height] : [device.height, device.width];
    const file = `splash-${width * device.ratio}x${height * device.ratio}.png`;

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: device.ratio,
    });
    const tab = await context.newPage();
    await tab.setContent(page(width, height));
    await tab.locator("img").evaluate((img) => img.decode());
    await tab.screenshot({ path: join(outDir, file) });
    await context.close();

    // iOS keeps device-width/height in portrait terms whichever way it's held.
    const media =
      `(device-width: ${device.width}px) and (device-height: ${device.height}px)` +
      ` and (-webkit-device-pixel-ratio: ${device.ratio}) and (orientation: ${orientation})`;
    tags.push(`<link rel="apple-touch-startup-image" media="${media}" href="/splash/${file}" />`);
  }
}

await browser.close();

const index = await readFile(indexPath, "utf8");
const start = index.indexOf(START);
const end = index.indexOf(END);
if (start === -1 || end === -1) throw new Error(`index.html: ${START} … ${END} not found`);
const indent = "\n    ";
await writeFile(
  indexPath,
  index.slice(0, start + START.length) + indent + tags.join(indent) + indent + index.slice(end)
);

console.log(`splash-screens: ${(await readdir(outDir)).length} images in public/splash/, ${tags.length} tags in index.html`);
