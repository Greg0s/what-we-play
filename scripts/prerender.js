/**
 * Writes every page of the site into dist/ after `vite build`.
 *
 * GitHub Pages only serves files, so there is no server to render on request —
 * but the whole catalogue is known at build time, so each page can be rendered
 * once, here, and shipped as static HTML. That is what makes the games visible
 * to crawlers that do not run JavaScript, and what gives each language and each
 * player count a real URL of its own.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const templatePath = path.join(distDir, "index.html");

const ROOT_PLACEHOLDER = '<div id="root"></div>';
const HEAD_START = "<!--head:start-->";
const HEAD_END = "<!--head:end-->";

const { renderAllPages, buildSitemap, buildLlmsTxt } = await import(
  pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href
);

/**
 * When the content itself last changed — not when this build ran. A date that
 * moved on every deploy would teach crawlers to ignore the signal, so if git
 * cannot answer (shallow clone, no history) we publish no date at all rather
 * than a misleading one. CI fetches full history for this reason.
 */
function contentLastModified() {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", "src/games.json", "src/i18n/locales"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    return iso === "" ? undefined : iso;
  } catch {
    return undefined;
  }
}

const dateModified = contentLastModified();

const template = await readFile(templatePath, "utf8");

for (const marker of [ROOT_PLACEHOLDER, HEAD_START, HEAD_END]) {
  if (!template.includes(marker)) {
    throw new Error(`Marqueur introuvable dans dist/index.html : ${marker}`);
  }
}

const headStart = template.indexOf(HEAD_START);
const headEnd = template.indexOf(HEAD_END) + HEAD_END.length;

const pages = renderAllPages({ dateModified });

for (const page of pages) {
  if (page.html.trim() === "") {
    throw new Error(`Rendu vide pour ${page.path}`);
  }

  const output =
    template.slice(0, headStart) +
    page.head +
    template.slice(headEnd).replace(
      ROOT_PLACEHOLDER,
      `<div id="root">${page.html}</div>`
    );

  // `lang` is set on the template's <html>, which sits before the head block.
  const withLang = output.replace('<html lang="en">', `<html lang="${page.language}">`);

  const missing = page.gameNames.filter((name) => !withLang.includes(name));
  if (missing.length > 0) {
    throw new Error(`Jeux absents de ${page.path} : ${missing.join(", ")}`);
  }

  const fileDir = path.join(distDir, page.path);
  await mkdir(fileDir, { recursive: true });
  await writeFile(path.join(fileDir, "index.html"), withLang);
}

await writeFile(path.join(distDir, "sitemap.xml"), buildSitemap());
await writeFile(path.join(distDir, "llms.txt"), buildLlmsTxt());

/**
 * The service worker (see scripts/service-worker.js): precaches every built
 * asset, the icons and each language's landing page, under a version that
 * changes with any of them, so each deploy replaces the old caches.
 */
const landings = pages.filter((page) => page.isHome).map((page) => page.path);
const assets = (await readdir(path.join(distDir, "assets"))).map((file) => `/assets/${file}`);
const precache = [
  ...landings,
  ...assets,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];
const versionHash = createHash("sha256");
for (const url of precache) {
  versionHash.update(url);
  versionHash.update(await readFile(path.join(distDir, url, url.endsWith("/") ? "index.html" : "")));
}
const workerTemplate = await readFile(path.join(root, "scripts", "service-worker.js"), "utf8");
const worker = workerTemplate
  .replace('"__VERSION__"', JSON.stringify(versionHash.digest("hex").slice(0, 12)))
  .replace("/*__PRECACHE__*/ []", JSON.stringify(precache))
  .replace('/*__LANDINGS__*/ ["/"]', JSON.stringify(landings));
if (worker.includes("__")) {
  throw new Error("scripts/service-worker.js : un emplacement n'a pas été rempli");
}
await writeFile(path.join(distDir, "sw.js"), worker);

console.log(
  `prerender: ${pages.length} pages écrites dans dist/, sitemap.xml et llms.txt régénérés, sw.js (${precache.length} fichiers en cache)` +
    (dateModified ? `, dateModified=${dateModified}` : ", sans dateModified (pas d'historique git)")
);
