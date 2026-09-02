/**
 * Writes the app's HTML into dist/index.html after `vite build`.
 *
 * GitHub Pages only serves files, so there is no server to render on request —
 * but the whole catalogue is known at build time, so the page can simply be
 * rendered once, here, and shipped as static HTML. That is what makes the games
 * visible to crawlers that do not run JavaScript.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "dist", "index.html");
const PLACEHOLDER = '<div id="root"></div>';

const { render } = await import(
  pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href
);

const template = await readFile(indexPath, "utf8");
if (!template.includes(PLACEHOLDER)) {
  throw new Error(
    `Point d'injection introuvable dans dist/index.html : ${PLACEHOLDER}`
  );
}

const { html, gameNames } = render();
if (html.trim() === "") {
  throw new Error("Le rendu serveur a produit un HTML vide.");
}

const output = template.replace(PLACEHOLDER, `<div id="root">${html}</div>`);

// The point of the exercise is that this content survives into the file a
// crawler downloads, so check it rather than assume it.
const missing = gameNames.filter((name) => !output.includes(name));
if (missing.length > 0) {
  throw new Error(
    `Jeux absents du HTML prérendu : ${missing.join(", ")}`
  );
}

await writeFile(indexPath, output);

const kb = (Buffer.byteLength(output) / 1024).toFixed(2);
console.log(
  `prerender: dist/index.html — ${gameNames.length} jeux dans le HTML, ${kb} kB`
);
