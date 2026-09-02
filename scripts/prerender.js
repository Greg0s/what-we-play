/**
 * Writes every page of the site into dist/ after `vite build`.
 *
 * GitHub Pages only serves files, so there is no server to render on request —
 * but the whole catalogue is known at build time, so each page can be rendered
 * once, here, and shipped as static HTML. That is what makes the games visible
 * to crawlers that do not run JavaScript, and what gives each language and each
 * player count a real URL of its own.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const templatePath = path.join(distDir, "index.html");

const ROOT_PLACEHOLDER = '<div id="root"></div>';
const HEAD_START = "<!--head:start-->";
const HEAD_END = "<!--head:end-->";

const { renderAllPages, buildSitemap } = await import(
  pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href
);

const template = await readFile(templatePath, "utf8");

for (const marker of [ROOT_PLACEHOLDER, HEAD_START, HEAD_END]) {
  if (!template.includes(marker)) {
    throw new Error(`Marqueur introuvable dans dist/index.html : ${marker}`);
  }
}

const headStart = template.indexOf(HEAD_START);
const headEnd = template.indexOf(HEAD_END) + HEAD_END.length;

const pages = renderAllPages();

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

console.log(
  `prerender: ${pages.length} pages écrites dans dist/, sitemap.xml régénéré`
);
