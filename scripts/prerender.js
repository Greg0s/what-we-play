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
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const templatePath = path.join(distDir, "index.html");

const ROOT_PLACEHOLDER = '<div id="root"></div>';
const HEAD_START = "<!--head:start-->";
const HEAD_END = "<!--head:end-->";
const PRELOAD_MARKER = "<!--preload:banner-->";

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

let template = await readFile(templatePath, "utf8");

/**
 * The banner is a CSS background, so the browser only discovers it after the
 * stylesheet has parsed — late, for what is the largest thing on screen.
 * Preloading it moves that discovery into the initial HTML. Its hashed name is
 * only knowable here, once Vite has written the CSS.
 */
async function bannerPreload() {
  const cssFiles = (await readdir(path.join(distDir, "assets"))).filter((name) =>
    name.endsWith(".css")
  );

  for (const name of cssFiles) {
    const css = await readFile(path.join(distDir, "assets", name), "utf8");
    const match = css.match(/url\((\/assets\/banner-[^)"']+)\)/);
    if (match) {
      return `<link rel="preload" as="image" href="${match[1]}" fetchpriority="high" />`;
    }
  }

  throw new Error("Bannière introuvable dans le CSS construit : preload impossible");
}

if (!template.includes(PRELOAD_MARKER)) {
  throw new Error(`Marqueur introuvable dans dist/index.html : ${PRELOAD_MARKER}`);
}
template = template.replace(PRELOAD_MARKER, await bannerPreload());

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

console.log(
  `prerender: ${pages.length} pages écrites dans dist/, sitemap.xml et llms.txt régénérés` +
    (dateModified ? `, dateModified=${dateModified}` : ", sans dateModified (pas d'historique git)")
);
